import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { ShoppingCart, Plus, Minus, Trash2, DollarSign, CheckCircle } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

type CartItem = {
  id: string;
  product_id: string;
  price: number;
  quantity: number;
  products: {
    name: string;
    brand: string | null;
    image_url: string | null;
  };
};

type GrocerySession = {
  id: string;
  name: string;
  store_name: string | null;
  store_location: string | null;
  spending_limit: number;
  grocery_type: string;
  is_active: boolean;
  created_at: string;
};

export default function GroceryScreen() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [spendingLimit, setSpendingLimit] = useState(0);
  const [editingLimit, setEditingLimit] = useState(false);
  const [limitInput, setLimitInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [activeSession, setActiveSession] = useState<GrocerySession | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadActiveSession();
  }, []);

  useEffect(() => {
    if (activeSession) {
      loadCart();
    }
  }, [activeSession]);

  const loadActiveSession = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('grocery_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      setActiveSession(data);
      if (data) {
        setSpendingLimit(data.spending_limit || 0);
        setLimitInput(data.spending_limit?.toString() || '0');
      }
    } catch (error) {
      console.error('Error loading active session:', error);
    }
  };

  const loadCart = async () => {
    if (!activeSession) return;

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('cart_items')
        .select(
          `
          id,
          product_id,
          price,
          quantity,
          products (
            name,
            brand,
            image_url
          )
        `
        )
        .eq('user_id', user.id)
        .eq('session_id', activeSession.id);

      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };


  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await deleteItem(itemId);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId);

      if (error) throw error;
      await loadCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase.from('cart_items').delete().eq('id', itemId);

      if (error) throw error;
      await loadCart();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const saveSpendingLimit = async () => {
    if (!activeSession) return;

    const limit = parseFloat(limitInput);
    if (isNaN(limit) || limit < 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      const { error } = await supabase
        .from('grocery_sessions')
        .update({ spending_limit: limit })
        .eq('id', activeSession.id);

      if (error) throw error;
      setSpendingLimit(limit);
      setActiveSession({ ...activeSession, spending_limit: limit });
      setEditingLimit(false);
      Alert.alert('Success', 'Spending limit updated');
    } catch (error) {
      console.error('Error saving spending limit:', error);
      Alert.alert('Error', 'Failed to save spending limit');
    }
  };


  const clearCart = async () => {
    if (!activeSession) return;

    Alert.alert('Clear Cart', 'Are you sure you want to clear your cart?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          try {
            const {
              data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
              .from('cart_items')
              .delete()
              .eq('user_id', user.id)
              .eq('session_id', activeSession.id);

            if (error) throw error;
            await loadCart();
          } catch (error) {
            console.error('Error clearing cart:', error);
          }
        },
      },
    ]);
  };

  const completeCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Add items to your cart before checking out');
      return;
    }

    if (!activeSession) {
      Alert.alert('Error', 'No active session');
      return;
    }

    Alert.alert(
      'Complete Checkout',
      `Checkout ${cartItems.length} items for $${cartTotal.toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            setCheckoutLoading(true);
            try {
              const {
                data: { user },
              } = await supabase.auth.getUser();
              if (!user) {
                setCheckoutLoading(false);
                return;
              }

              const { data: session, error: sessionError } = await supabase
                .from('checkout_sessions')
                .insert({
                  user_id: user.id,
                  total_amount: cartTotal,
                  item_count: cartItems.length,
                })
                .select('id')
                .single();

              if (sessionError || !session) throw sessionError;

              const checkoutItems = cartItems.map((item) => ({
                session_id: session.id,
                product_id: item.product_id,
                price: item.price,
                quantity: item.quantity,
              }));

              const { error: itemsError } = await supabase
                .from('checkout_items')
                .insert(checkoutItems);

              if (itemsError) throw itemsError;

              await supabase
                .from('cart_items')
                .delete()
                .eq('user_id', user.id)
                .eq('session_id', activeSession.id);

              await supabase
                .from('grocery_sessions')
                .delete()
                .eq('id', activeSession.id);

              setCheckoutLoading(false);
              Alert.alert('Success', 'Checkout completed!');
              await loadActiveSession();
            } catch (error) {
              console.error('Error completing checkout:', error);
              setCheckoutLoading(false);
              Alert.alert('Error', 'Failed to complete checkout');
            }
          },
        },
      ]
    );
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isOverBudget = spendingLimit > 0 && cartTotal > spendingLimit;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadCart} />}>
        {activeSession && (
          <View style={styles.sessionInfoCard}>
            <View style={styles.sessionInfoHeader}>
              <View style={styles.sessionInfoText}>
                <Text style={styles.sessionName}>{activeSession.name}</Text>
                {activeSession.store_name && (
                  <Text style={styles.sessionDetail}>
                    📍 {activeSession.store_name}
                    {activeSession.store_location ? ` - ${activeSession.store_location}` : ''}
                  </Text>
                )}
                <Text style={styles.sessionDetail}>
                  🏷️ {activeSession.grocery_type}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.endSessionButton}
              onPress={() => {
                Alert.alert(
                  'End Session',
                  'Are you sure you want to end this grocery session? Your cart will be cleared.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'End Session',
                      style: 'destructive',
                      onPress: async () => {
                        try {
                          const {
                            data: { user },
                          } = await supabase.auth.getUser();
                          if (!user) return;

                          await supabase
                            .from('cart_items')
                            .delete()
                            .eq('user_id', user.id)
                            .eq('session_id', activeSession.id);

                          await supabase
                            .from('grocery_sessions')
                            .update({ is_active: false, ended_at: new Date().toISOString() })
                            .eq('id', activeSession.id);

                          setActiveSession(null);
                          setCartItems([]);
                          Alert.alert('Success', 'Session ended');
                        } catch (error) {
                          console.error('Error ending session:', error);
                          Alert.alert('Error', 'Failed to end session');
                        }
                      },
                    },
                  ]
                );
              }}>
              <Text style={styles.endSessionButtonText}>End Session</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.limitSection}>
          <View style={styles.limitHeader}>
            <Text style={styles.limitTitle}>Spending Limit</Text>
            {!editingLimit && (
              <TouchableOpacity onPress={() => setEditingLimit(true)}>
                <Text style={styles.editButton}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          {editingLimit ? (
            <View style={styles.limitEditRow}>
              <Text style={styles.dollarSign}>$</Text>
              <TextInput
                style={styles.limitInput}
                value={limitInput}
                onChangeText={setLimitInput}
                keyboardType="decimal-pad"
                placeholder="0.00"
              />
              <TouchableOpacity style={styles.saveLimitButton} onPress={saveSpendingLimit}>
                <Text style={styles.saveLimitButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.limitAmount}>
              {spendingLimit > 0 ? `$${spendingLimit.toFixed(2)}` : 'Not set'}
            </Text>
          )}
        </View>

        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Cart Total</Text>
          <Text style={[styles.totalAmount, isOverBudget && styles.overBudget]}>
            ${cartTotal.toFixed(2)}
          </Text>
          <Text style={styles.itemCount}>{cartItems.length} items</Text>
        </View>

        {isOverBudget && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              Over budget by ${(cartTotal - spendingLimit).toFixed(2)}
            </Text>
          </View>
        )}

        {!activeSession ? (
          <View style={styles.emptyCart}>
            <ShoppingCart size={64} color="#d1d5db" />
            <Text style={styles.emptyCartTitle}>No active grocery session</Text>
            <Text style={styles.emptyCartText}>Go to Home and start a new session</Text>
          </View>
        ) : cartItems.length === 0 ? (
          <View style={styles.emptyCart}>
            <ShoppingCart size={64} color="#d1d5db" />
            <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
            <Text style={styles.emptyCartText}>Scan products to add them to your cart</Text>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => router.push('/(tabs)/grocery')}>
              <Text style={styles.scanButtonText}>Go to Scanner</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.cartItemsHeader}>
              <Text style={styles.cartItemsTitle}>Items in Cart</Text>
              <TouchableOpacity onPress={clearCart}>
                <Text style={styles.clearButton}>Clear All</Text>
              </TouchableOpacity>
            </View>

            {cartItems.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <View style={styles.cartItemInfo}>
                  <Text style={styles.cartItemName}>
                    {(item.products as any)?.brand || 'Unknown Brand'} - {(item.products as any)?.name || 'Unknown Product'}
                  </Text>
                  <Text style={styles.cartItemPrice}>${item.price.toFixed(2)} each</Text>
                  <Text style={styles.cartItemTotal}>
                    Total: ${(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>

                <View style={styles.cartItemActions}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, item.quantity - 1)}>
                    <Minus size={16} color="#374151" />
                  </TouchableOpacity>

                  <Text style={styles.quantityText}>{item.quantity}</Text>

                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, item.quantity + 1)}>
                    <Plus size={16} color="#374151" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.deleteButton} onPress={() => deleteItem(item.id)}>
                    <Trash2 size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.checkoutButton, checkoutLoading && styles.checkoutButtonDisabled]}
              onPress={completeCheckout}
              disabled={checkoutLoading}>
              <CheckCircle size={24} color="#fff" />
              <Text style={styles.checkoutButtonText}>
                {checkoutLoading ? 'Processing...' : 'Complete Checkout'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sessionInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sessionInfoHeader: {
    marginBottom: 12,
  },
  sessionInfoText: {
    flex: 1,
  },
  sessionName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  sessionDetail: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 4,
  },
  endSessionButton: {
    backgroundColor: '#fee2e2',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  endSessionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#dc2626',
  },
  limitSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  limitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  limitTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  editButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  limitAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
  },
  limitEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dollarSign: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
  },
  limitInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    padding: 0,
  },
  saveLimitButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveLimitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  totalSection: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f0fdf4',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  overBudget: {
    color: '#fef2f2',
  },
  itemCount: {
    fontSize: 14,
    color: '#f0fdf4',
  },
  warningBox: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  warningText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
    textAlign: 'center',
  },
  emptyCart: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyCartTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyCartText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#6b7280',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cartItemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cartItemsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  clearButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  cartItemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  cartItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    minWidth: 24,
    textAlign: 'center',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
  },
  checkoutButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  checkoutButtonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.6,
  },
});
