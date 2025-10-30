import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Trash2, ShoppingCart, DollarSign, CheckCircle } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

type CartItem = {
  id: string;
  product_id: string;
  price: number;
  quantity: number;
  products: {
    name: string;
    brand: string | null;
  };
};

type GrocerySession = {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
  status: 'created' | 'in_progress' | 'completed';
  store_name: string | null;
  spending_limit: number | null;
  grocery_type: 'regular' | 'special_event' | 'bulk' | 'weekly' | 'monthly';
};

export default function GrocerySessionDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [session, setSession] = useState<GrocerySession | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSession();
    loadItems();
  }, [id]);

  const loadSession = async () => {
    try {
      const { data, error } = await supabase
        .from('grocery_sessions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setSession(data);
    } catch (error) {
      console.error('Error loading session:', error);
      Alert.alert('Error', 'Failed to load session');
    }
  };

  const loadItems = async () => {
    setLoading(true);
    try {
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
            brand
          )
        `
        )
        .eq('session_id', id);

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const setActiveSession = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('grocery_sessions')
        .update({ is_active: false })
        .eq('user_id', user.id);

      await supabase
        .from('grocery_sessions')
        .update({ is_active: true })
        .eq('id', id);

      Alert.alert('Success', 'This session is now active');
      await loadSession();
    } catch (error) {
      console.error('Error setting active session:', error);
      Alert.alert('Error', 'Failed to set active session');
    }
  };

  const closeShoppingSession = async () => {
    if (items.length === 0) {
      Alert.alert('Empty Session', 'Add items before ending the shopping session');
      return;
    }

    Alert.alert(
      'End Grocery Session',
      `Complete checkout for ${items.length} items ($${total.toFixed(2)})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Grocery',
          onPress: async () => {
            try {
              const {
                data: { user },
              } = await supabase.auth.getUser();
              if (!user) return;

              const endTime = new Date().toISOString();

              await supabase
                .from('grocery_sessions')
                .update({
                  ended_at: endTime,
                  status: 'completed',
                })
                .eq('id', id);

              const { data: checkoutSession, error: sessionError } = await supabase
                .from('checkout_sessions')
                .insert({
                  user_id: user.id,
                  total_amount: total,
                  item_count: items.length,
                })
                .select('id')
                .single();

              if (sessionError || !checkoutSession) throw sessionError;

              const checkoutItems = items.map((item) => ({
                session_id: checkoutSession.id,
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
                .eq('session_id', id);

              await supabase.from('grocery_sessions').delete().eq('id', id);

              Alert.alert('Success', 'Shopping session completed!');
              router.back();
            } catch (error) {
              console.error('Error completing checkout:', error);
              Alert.alert('Error', 'Failed to complete checkout');
            }
          },
        },
      ]
    );
  };

  const deleteSession = async () => {
    Alert.alert('Delete Session', `Delete "${session?.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase.from('grocery_sessions').delete().eq('id', id);

            if (error) throw error;
            Alert.alert('Success', 'Session deleted');
            router.back();
          } catch (error) {
            console.error('Error deleting session:', error);
            Alert.alert('Error', 'Failed to delete session');
          }
        },
      },
    ]);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!session) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{session.name}</Text>
          {session.is_active && <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>Active</Text>
          </View>}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadItems} />}>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Store</Text>
            <Text style={styles.infoValue}>{session.store_name || 'Not specified'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type</Text>
            <Text style={styles.infoValue}>
              {session.grocery_type.replace('_', ' ').charAt(0).toUpperCase() + session.grocery_type.slice(1).replace('_', ' ')}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Budget</Text>
            <Text style={styles.infoValue}>
              ${session.spending_limit?.toFixed(2) || '0.00'}
            </Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <ShoppingCart size={24} color="#ff00ff" />
              <Text style={styles.summaryValue}>{items.length}</Text>
              <Text style={styles.summaryLabel}>Items</Text>
            </View>
            <View style={styles.summaryItem}>
              <DollarSign size={24} color="#3b82f6" />
              <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
              <Text style={styles.summaryLabel}>Current</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[
                styles.summaryValue,
                total > (session.spending_limit || 0) ? styles.overBudget : styles.underBudget
              ]}>
                ${(session.spending_limit || 0) - total > 0 ? '+' : ''}
                {((session.spending_limit || 0) - total).toFixed(2)}
              </Text>
              <Text style={styles.summaryLabel}>Remaining</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsCard}>
          {items.length > 0 && (
            <TouchableOpacity
              style={[styles.actionButton, styles.endGroceryButton]}
              onPress={closeShoppingSession}>
              <CheckCircle size={20} color="#fff" />
              <Text style={styles.actionButtonText}>End Grocery</Text>
            </TouchableOpacity>
          )}
          {!session.is_active && (
            <TouchableOpacity style={styles.actionButton} onPress={setActiveSession}>
              <Text style={styles.actionButtonText}>Set as Active Session</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={deleteSession}>
            <Trash2 size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Delete Session</Text>
          </TouchableOpacity>
        </View>

        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <ShoppingCart size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>No items in this session</Text>
            <Text style={styles.emptySubtext}>
              {session.is_active
                ? 'Start scanning items to add them here'
                : 'Make this session active to add items'}
            </Text>
          </View>
        ) : (
          <View style={styles.itemsCard}>
            <Text style={styles.sectionTitle}>Items</Text>
            {items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>
                    {(item.products as any)?.brand || 'Unknown'} - {(item.products as any)?.name || 'Unknown'}
                  </Text>
                  <Text style={styles.itemDetails}>
                    Qty: {item.quantity} × ${item.price.toFixed(2)}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>${(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            ))}
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  activeBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#6b7280',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    gap: 8,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  overBudget: {
    color: '#ef4444',
  },
  underBudget: {
    color: '#ff00ff',
  },
  actionsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff00ff',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  endGroceryButton: {
    backgroundColor: '#3b82f6',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  itemsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 12,
    color: '#6b7280',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
});
