import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Calendar, ShoppingBag, Package, Plus, ChevronRight } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import StartGroceryFlow from '@/components/StartGroceryFlow';

type CheckoutSession = {
  id: string;
  total_amount: number;
  item_count: number;
  completed_at: string;
  items: Array<{
    id: string;
    price: number;
    quantity: number;
    products: {
      name: string;
      brand: string | null;
    };
  }>;
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

export default function HistoryScreen() {
  const router = useRouter();
  const [checkoutSessions, setCheckoutSessions] = useState<CheckoutSession[]>([]);
  const [grocerySessions, setGrocerySessions] = useState<GrocerySession[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [showStartFlow, setShowStartFlow] = useState(false);

  useEffect(() => {
    loadHistory();
    loadGrocerySessions();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: sessionsData, error } = await supabase
        .from('checkout_sessions')
        .select('id, total_amount, item_count, completed_at')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) throw error;

      const sessionsWithItems: CheckoutSession[] = [];

      for (const session of sessionsData || []) {
        const { data: items } = await supabase
          .from('checkout_items')
          .select(
            `
            id,
            price,
            quantity,
            products (
              name,
              brand
            )
          `
          )
          .eq('session_id', session.id);

        sessionsWithItems.push({
          ...session,
          items: items || [],
        });
      }

      setCheckoutSessions(sessionsWithItems);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGrocerySessions = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('grocery_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGrocerySessions(data || []);
    } catch (error) {
      console.error('Error loading grocery sessions:', error);
    }
  };

  const handleGroceryStarted = (sessionId: string) => {
    setShowStartFlow(false);
    loadGrocerySessions();
    router.push(`/grocery-session/${sessionId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const toggleSession = (sessionId: string) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId);
  };

  const groupedSessions = checkoutSessions.reduce(
    (groups, session) => {
      const date = new Date(session.completed_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(session);
      return groups;
    },
    {} as Record<string, CheckoutSession[]>
  );

  if (checkoutSessions.length === 0 && grocerySessions.length === 0) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.emptyContainer}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadHistory} />}>
        <Calendar size={64} color="#d1d5db" />
        <Text style={styles.emptyTitle}>No Purchase History</Text>
        <Text style={styles.emptyText}>
          Complete checkouts to see your grocery shopping history here
        </Text>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadHistory} />}>
      <TouchableOpacity
        style={styles.startGroceryButton}
        onPress={() => setShowStartFlow(true)}>
        <Plus size={24} color="#fff" />
        <Text style={styles.startGroceryButtonText}>Start Grocery</Text>
      </TouchableOpacity>

      <View style={styles.sessionSection}>
        <Text style={styles.sessionTitle}>Active Sessions</Text>

        {grocerySessions.length === 0 ? (
          <View style={styles.emptySessionsState}>
            <Text style={styles.emptySessionsText}>No grocery sessions yet</Text>
            <Text style={styles.emptySessionsSubtext}>
              Tap the + button to create your first session
            </Text>
          </View>
        ) : (
          grocerySessions.map((session) => (
            <TouchableOpacity
              key={session.id}
              style={[styles.sessionCard, session.is_active && styles.activeSessionCard]}
              onPress={() => router.push(`/grocery-session/${session.id}`)}>
              <View style={styles.sessionCardContent}>
                <View style={styles.sessionCardLeft}>
                  <Text style={styles.sessionCardTitle}>{session.name}</Text>
                  <Text style={styles.sessionCardDate}>
                    {new Date(session.created_at).toLocaleDateString()}
                    {session.status === 'in_progress' && ' • Shopping'}
                  </Text>
                </View>
                <View style={styles.sessionCardRight}>
                  {session.is_active && (
                    <View style={styles.activeLabel}>
                      <Text style={styles.activeLabelText}>Active</Text>
                    </View>
                  )}
                  {session.status === 'in_progress' && (
                    <View style={styles.inProgressLabel}>
                      <Text style={styles.inProgressLabelText}>In Progress</Text>
                    </View>
                  )}
                  <ChevronRight size={20} color="#9ca3af" />
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>All Time Stats</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ShoppingBag size={24} color="#ff00ff" />
            <Text style={styles.statValue}>{checkoutSessions.length}</Text>
            <Text style={styles.statLabel}>Trips</Text>
          </View>
          <View style={styles.statItem}>
            <Package size={24} color="#3b82f6" />
            <Text style={styles.statValue}>
              {checkoutSessions.reduce((sum, s) => sum + s.item_count, 0)}
            </Text>
            <Text style={styles.statLabel}>Items</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statCurrency}>$</Text>
            <Text style={styles.statValue}>
              {checkoutSessions.reduce((sum, s) => sum + s.total_amount, 0).toFixed(0)}
            </Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
        </View>
      </View>

      {Object.entries(groupedSessions).map(([month, monthSessions]) => (
        <View key={month} style={styles.monthGroup}>
          <Text style={styles.monthHeader}>{month}</Text>

          {monthSessions.map((session) => {
            const isExpanded = expandedSession === session.id;

            return (
              <TouchableOpacity
                key={session.id}
                style={styles.sessionCard}
                onPress={() => toggleSession(session.id)}
                activeOpacity={0.7}>
                <View style={styles.sessionHeader}>
                  <View style={styles.sessionHeaderLeft}>
                    <Text style={styles.sessionDate}>{formatDate(session.completed_at)}</Text>
                    <Text style={styles.sessionItems}>{session.item_count} items</Text>
                  </View>
                  <Text style={styles.sessionTotal}>${session.total_amount.toFixed(2)}</Text>
                </View>

                {isExpanded && (
                  <View style={styles.sessionDetails}>
                    <View style={styles.divider} />
                    {session.items.map((item) => (
                      <View key={item.id} style={styles.itemRow}>
                        <View style={styles.itemInfo}>
                          <Text style={styles.itemName}>
                            {(item.products as any)?.brand || 'Unknown Brand'} - {(item.products as any)?.name || 'Unknown Product'}
                          </Text>
                          <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                        </View>
                        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
      </ScrollView>

      <StartGroceryFlow
        visible={showStartFlow}
        onClose={() => setShowStartFlow(false)}
        onSuccess={handleGroceryStarted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    padding: 20,
  },
  startGroceryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff00ff',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  startGroceryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statCurrency: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ff00ff',
    marginBottom: -8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  monthGroup: {
    marginBottom: 24,
  },
  monthHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionHeaderLeft: {
    flex: 1,
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  sessionItems: {
    fontSize: 14,
    color: '#6b7280',
  },
  sessionTotal: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ff00ff',
  },
  sessionDetails: {
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#6b7280',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  sessionSection: {
    marginBottom: 16,
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  emptySessionsState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptySessionsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  emptySessionsSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeSessionCard: {
    borderColor: '#ff00ff',
    borderWidth: 2,
  },
  sessionCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionCardLeft: {
    flex: 1,
  },
  sessionCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  sessionCardDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  sessionCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeLabel: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  inProgressLabel: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  inProgressLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },
});
