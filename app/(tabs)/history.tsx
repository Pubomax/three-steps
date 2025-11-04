import { useState, useEffect, useMemo } from 'react';
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
import Svg, { Path, Rect, Line } from 'react-native-svg';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import StartGroceryFlow from '@/components/StartGroceryFlow';

type CheckoutSession = {
  id: string;
  total_amount: number;
  item_count: number;
  completed_at: string;
  store_name?: string | null;
  grocery_session_id?: string | null;
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
  const [timeFilter, setTimeFilter] = useState<'weekly' | 'monthly'>('weekly');
  const [groupFilter, setGroupFilter] = useState<'date' | 'store'>('date');

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
        .select(`
          id,
          total_amount,
          item_count,
          completed_at,
          store_name,
          grocery_session_id,
          checkout_items (
            id,
            price,
            quantity,
            products (
              name,
              brand
            )
          )
        `)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) throw error;

      let sessionsWithItems: CheckoutSession[] = (sessionsData || []).map((s: any) => ({
        id: s.id,
        total_amount: s.total_amount,
        item_count: s.item_count,
        completed_at: s.completed_at,
        store_name: s.store_name ?? null,
        grocery_session_id: s.grocery_session_id ?? null,
        items: s.checkout_items || [],
      }));

      // Backfill store names for older sessions
      const missing = sessionsWithItems.filter((s) => !s.store_name && s.grocery_session_id);
      if (missing.length > 0) {
        const ids = missing.map((s) => s.grocery_session_id as string);
        const { data: gs } = await supabase
          .from('grocery_sessions')
          .select('id, store_name')
          .in('id', ids);
        const idToStore: Record<string, string | null> = {};
        (gs || []).forEach((g: any) => { idToStore[g.id] = g.store_name; });
        sessionsWithItems = sessionsWithItems.map((s) =>
          !s.store_name && s.grocery_session_id
            ? { ...s, store_name: idToStore[s.grocery_session_id] ?? null }
            : s
        );
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

  const storeGrouped = useMemo(() => {
    const g: Record<string, CheckoutSession[]> = {};
    (checkoutSessions || []).forEach((s: any) => {
      const key = s.store_name && s.store_name.trim().length > 0 ? s.store_name : 'Unknown Store';
      if (!g[key]) g[key] = [];
      g[key].push(s);
    });
    return g;
  }, [checkoutSessions]);

  // Build series for weekly/monthly spending
  const chartSeries = useMemo(() => {
    const now = new Date();
    if (timeFilter === 'weekly') {
      // Last 8 weeks
      const weeks = Array.from({ length: 8 }).map((_, i) => {
        const end = new Date(now);
        end.setDate(end.getDate() - i * 7);
        const start = new Date(end);
        start.setDate(end.getDate() - 6);
        return { start, end };
      }).reverse();
      const values = weeks.map(({ start, end }) => {
        return checkoutSessions.reduce((sum, s) => {
          const d = new Date(s.completed_at);
          if (d >= start && d <= end) return sum + (s.total_amount || 0);
          return sum;
        }, 0);
      });
      return values;
    } else {
      // Last 6 months
      const months: { y: number; m: number }[] = [];
      const cur = new Date(now.getFullYear(), now.getMonth(), 1);
      for (let i = 5; i >= 0; i--) {
        const d = new Date(cur.getFullYear(), cur.getMonth() - i, 1);
        months.push({ y: d.getFullYear(), m: d.getMonth() });
      }
      const values = months.map(({ y, m }) => {
        return checkoutSessions.reduce((sum, s) => {
          const d = new Date(s.completed_at);
          if (d.getFullYear() === y && d.getMonth() === m) return sum + (s.total_amount || 0);
          return sum;
        }, 0);
      });
      return values;
    }
  }, [checkoutSessions, timeFilter]);

  const totalInRange = useMemo(() => chartSeries.reduce((a, b) => a + b, 0), [chartSeries]);

  const buildPath = (values: number[], width: number, height: number) => {
    if (values.length === 0) return '';
    const max = Math.max(1, ...values);
    const step = width / Math.max(1, values.length - 1);
    return values
      .map((v, i) => {
        const x = i * step;
        const y = height - (v / max) * height;
        return `${i === 0 ? 'M' : 'L'}${x},${y}`;
      })
      .join(' ');
  };

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
      

      {/* Spending Overview */}
      <View style={styles.overviewCard}>
        <View style={styles.overviewHeader}>
          <Text style={styles.overviewTitle}>{timeFilter === 'weekly' ? 'Last 8 Weeks Spending' : 'Last 6 Months Spending'}</Text>
          <Text style={styles.overviewTotal}>${totalInRange.toFixed(2)}</Text>
        </View>
        <Svg width="100%" height={120} viewBox="0 0 300 120" preserveAspectRatio="none">
          <Rect x={0} y={0} width={300} height={120} fill="#ffffff" />
          <Path d={buildPath(chartSeries, 300, 100)} stroke="#ff00ff" strokeWidth={3} fill="none" />
        </Svg>
        <View style={styles.overviewFilters}>
          <TouchableOpacity
            style={[styles.filterPill, timeFilter === 'weekly' && styles.filterPillActive]}
            onPress={() => setTimeFilter('weekly')}>
            <Text style={[styles.filterPillText, timeFilter === 'weekly' && styles.filterPillTextActive]}>Weekly</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterPill, timeFilter === 'monthly' && styles.filterPillActive]}
            onPress={() => setTimeFilter('monthly')}>
            <Text style={[styles.filterPillText, timeFilter === 'monthly' && styles.filterPillTextActive]}>Monthly</Text>
          </TouchableOpacity>
        </View>
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

      {/* History Filters */}
      <View style={styles.sessionTitleRow}>
        <Text style={styles.sessionTitle}>History</Text>
        <View style={styles.groupFilters}>
          <TouchableOpacity
            style={[styles.groupPill, groupFilter === 'date' && styles.groupPillActive]}
            onPress={() => setGroupFilter('date')}>
            <Text style={[styles.groupPillText, groupFilter === 'date' && styles.groupPillTextActive]}>By Date</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.groupPill, groupFilter === 'store' && styles.groupPillActive]}
            onPress={() => setGroupFilter('store')}>
            <Text style={[styles.groupPillText, groupFilter === 'store' && styles.groupPillTextActive]}>By Store</Text>
          </TouchableOpacity>
        </View>
      </View>

      {groupFilter === 'date' && Object.entries(groupedSessions).map(([month, monthSessions]) => (
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

      {groupFilter === 'store' && Object.entries(storeGrouped).map(([store, sessions]) => (
        <View key={store} style={styles.monthGroup}>
          <Text style={styles.monthHeader}>{store}</Text>
          {sessions.map((session) => (
            <View key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <View style={styles.sessionHeaderLeft}>
                  <Text style={styles.sessionDate}>{formatDate(session.completed_at)}</Text>
                  <Text style={styles.sessionItems}>{session.item_count} items</Text>
                </View>
                <Text style={styles.sessionTotal}>${session.total_amount.toFixed(2)}</Text>
              </View>
            </View>
          ))}
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
  overviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  overviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  overviewTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  overviewFilters: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterPillActive: {
    backgroundColor: '#fff0ff',
    borderColor: '#ff00ff',
  },
  filterPillText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#ff00ff',
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
  sessionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  groupPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  groupPillActive: {
    backgroundColor: '#fff0ff',
    borderColor: '#ff00ff',
  },
  groupPillText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  groupPillTextActive: {
    color: '#ff00ff',
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
  grocerySessionCard: {
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
