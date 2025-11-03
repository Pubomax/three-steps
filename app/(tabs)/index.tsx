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
  Image,
} from 'react-native';
import { ArrowLeft, Plus, Minus, ShoppingCart } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';
import Svg, { Circle } from 'react-native-svg';
import { Database } from '@/types/database';

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
  spending_limit: number | null;
  grocery_type: string;
  is_active: boolean;
  created_at: string;
};

export default function CartScreen() {
  const { isGuest } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [spendingLimit, setSpendingLimit] = useState(0);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [activeSession, setActiveSession] = useState<GrocerySession | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadActiveSession();
  }, []);

  useEffect(() => {
    if (activeSession) {
      loadCart();

      // Set up real-time subscription for cart updates
      const channel = supabase
        .channel('cart-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'cart_items',
            filter: `session_id=eq.${activeSession.id}`,
          },
          (payload) => {
            console.log('Cart updated:', payload);
            loadCart();
          }
        )
        .subscribe();

      // Cleanup subscription on unmount
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [activeSession]);

  const loadActiveSession = async () => {
    try {
      if (isGuest) {
        // Load from AsyncStorage for guest users
        const sessionsJson = await AsyncStorage.getItem('guest_sessions');
        if (sessionsJson) {
          const sessions = JSON.parse(sessionsJson);
          const active = sessions.find((s: any) => s.is_active);
          setActiveSession(active || null);
          if (active) {
            setSpendingLimit(active.spending_limit || 0);
          }
        }
      } else {
        // Load from Supabase for authenticated users - fix the multiple rows issue
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('grocery_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        setActiveSession(data as GrocerySession | null);
        if (data) {
          setSpendingLimit((data as any).spending_limit || 0);
        }
      }
    } catch (error) {
      console.error('Error loading active session:', error);
    }
  };

  const loadCart = async () => {
    if (!activeSession) return;

    setLoading(true);
    try {
      if (isGuest) {
        // Load from AsyncStorage for guest users
        const cartJson = await AsyncStorage.getItem(`guest_cart_${activeSession.id}`);
        setCartItems(cartJson ? JSON.parse(cartJson) : []);
      } else {
        // Load from Supabase for authenticated users
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
      }
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
      if (isGuest && activeSession) {
        const cartJson = await AsyncStorage.getItem(`guest_cart_${activeSession.id}`);
        const cart = cartJson ? JSON.parse(cartJson) : [];
        const updated = cart.map((item: any) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        );
        await AsyncStorage.setItem(`guest_cart_${activeSession.id}`, JSON.stringify(updated));
        await loadCart();
      } else {
        const { error } = await (supabase as any)
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', itemId);

        if (error) throw error;
        await loadCart();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      if (isGuest && activeSession) {
        const cartJson = await AsyncStorage.getItem(`guest_cart_${activeSession.id}`);
        const cart = cartJson ? JSON.parse(cartJson) : [];
        const filtered = cart.filter((item: any) => item.id !== itemId);
        await AsyncStorage.setItem(`guest_cart_${activeSession.id}`, JSON.stringify(filtered));
        await loadCart();
      } else {
        const { error } = await supabase.from('cart_items').delete().eq('id', itemId);

        if (error) throw error;
        await loadCart();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
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
              if (isGuest) {
                // Guest checkout: Clear cart and end session in AsyncStorage
                await AsyncStorage.removeItem(`guest_cart_${activeSession.id}`);
                
                const sessionsJson = await AsyncStorage.getItem('guest_sessions');
                const sessions = sessionsJson ? JSON.parse(sessionsJson) : [];
                const updated = sessions.map((s: any) =>
                  s.id === activeSession.id
                    ? { ...s, is_active: false, status: 'completed', ended_at: new Date().toISOString() }
                    : s
                );
                await AsyncStorage.setItem('guest_sessions', JSON.stringify(updated));
                
                setCheckoutLoading(false);
                Alert.alert('Success', 'Checkout completed!');
                setActiveSession(null);
                setCartItems([]);
                await loadActiveSession();
              } else {
                const {
                  data: { user },
                } = await supabase.auth.getUser();
                if (!user) {
                  setCheckoutLoading(false);
                  return;
                }

                const { data: session, error: sessionError } = await (supabase as any)
                  .from('checkout_sessions')
                  .insert({
                    user_id: user.id,
                    total_amount: cartTotal,
                    item_count: cartItems.length,
                    store_name: activeSession.store_name,
                    store_location: activeSession.store_location,
                    grocery_session_id: activeSession.id,
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

                const { error: itemsError } = await (supabase as any)
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
              }
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
  const subtotal = cartTotal * 0.9; // Assuming 10% tax
  const tax = cartTotal - subtotal;
  const isOverBudget = spendingLimit > 0 && cartTotal > spendingLimit;
  
  // Calculate progress for the ring
  const progress = spendingLimit > 0 ? Math.min((cartTotal / spendingLimit) * 100, 100) : 0;
  const circumference = 2 * Math.PI * 46;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const BudgetRing = () => (
    <View style={styles.budgetRingContainer}>
      <Svg width={192} height={192} viewBox="0 0 100 100">
        <Circle
          cx="50"
          cy="50"
          r="46"
          stroke="#ff00ff20"
          strokeWidth="8"
          fill="transparent"
        />
        <Circle
          cx="50"
          cy="50"
          r="46"
          stroke="#ff00ff"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
      </Svg>
      <View style={styles.budgetRingContent}>
        <Text style={styles.budgetAmount}>${cartTotal.toFixed(2)}</Text>
        <Text style={styles.budgetLabel}>
          of ${spendingLimit > 0 ? spendingLimit.toFixed(2) : '0.00'} budget
        </Text>
      </View>
    </View>
  );

  if (!activeSession) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Cart</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.emptyCart}>
          <ShoppingCart size={64} color="#d1d5db" />
          <Text style={styles.emptyCartTitle}>No active grocery session</Text>
          <Text style={styles.emptyCartText}>Go to Home and start a new session</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Cart</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Text style={styles.editButton}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadCart} />}
      >
        {/* Budget Ring */}
        <BudgetRing />

        {/* Items Section */}
        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Items ({cartItems.length})</Text>
          
          {cartItems.length === 0 ? (
            <View style={styles.emptyItems}>
              <ShoppingCart size={32} color="#9ca3af" />
              <Text style={styles.emptyItemsText}>Your cart is empty</Text>
              <Text style={styles.emptyItemsSubtext}>Add items by scanning or searching</Text>
            </View>
          ) : (
            <View style={styles.itemsList}>
              {cartItems.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  <View style={styles.itemLeft}>
                    <View style={styles.itemImage}>
                      {item.products.image_url ? (
                        <Image source={{ uri: item.products.image_url }} style={styles.productImage} />
                      ) : (
                        <View style={styles.placeholderImage}>
                          <Text style={styles.placeholderText}>
                            {item.products.name?.charAt(0) || '?'}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>
                        {item.products.brand ? `${item.products.brand} - ` : ''}{item.products.name}
                      </Text>
                      <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus size={16} color="#ff00ff" />
                    </TouchableOpacity>
                    
                    <TextInput
                      style={styles.quantityInput}
                      value={item.quantity.toString()}
                      onChangeText={(text) => {
                        const qty = parseInt(text) || 1;
                        updateQuantity(item.id, qty);
                      }}
                      keyboardType="numeric"
                    />
                    
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus size={16} color="#ff00ff" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Summary Section */}
        {cartItems.length > 0 && (
          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Estimated Tax</Text>
              <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${cartTotal.toFixed(2)}</Text>
            </View>
          </View>
        )}

        {/* Checkout Button */}
        {cartItems.length > 0 && (
          <TouchableOpacity
            style={[styles.checkoutButton, checkoutLoading && styles.checkoutButtonDisabled]}
            onPress={completeCheckout}
            disabled={checkoutLoading}
          >
            <Text style={styles.checkoutButtonText}>
              {checkoutLoading ? 'Processing...' : 'Complete Checkout'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f5f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f5f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 24,
  },
  editButton: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ff00ff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  budgetRingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
    position: 'relative',
  },
  budgetRingContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  budgetLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  itemsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyItems: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyItemsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyItemsSubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  itemsList: {
    gap: 8,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  itemImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6b7280',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 14,
    color: '#6b7280',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ff00ff20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityInput: {
    width: 32,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  summarySection: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
    marginBottom: 32,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 16,
    color: '#6b7280',
  },
  totalRow: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  checkoutButton: {
    backgroundColor: '#ff00ff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  checkoutButtonDisabled: {
    opacity: 0.6,
  },
  checkoutButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyCartTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyCartText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});
