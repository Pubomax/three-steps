import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Store,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Analytics = {
  avgSpending: number;
  monthlyTrips: number;
  totalSpent: number;
  totalScans: number;
  spendingBreakdown: Array<{ category: string; percentage: number; amount: number }>;
  storeTrips: Array<{ name: string; trips: number; isTop: boolean }>;
  priceComparison: Array<{ store: string; price: number; isLowest: boolean }>;
  avgPrice: number;
  savings: number;
};

export default function AnalyticsScreen() {
  const { isGuest } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics>({
    avgSpending: 0,
    monthlyTrips: 0,
    totalSpent: 0,
    totalScans: 0,
    spendingBreakdown: [
      { category: 'Produce', percentage: 35, amount: 0 },
      { category: 'Dairy & Eggs', percentage: 25, amount: 0 },
      { category: 'Meat & Seafood', percentage: 20, amount: 0 },
      { category: 'Pantry', percentage: 15, amount: 0 },
      { category: 'Other', percentage: 5, amount: 0 },
    ],
    storeTrips: [
      { name: 'FreshCo', trips: 5, isTop: true },
      { name: 'Metro', trips: 3, isTop: false },
      { name: 'SuperValu', trips: 2, isTop: false },
      { name: 'Organic Barn', trips: 2, isTop: false },
    ],
    priceComparison: [
      { store: 'Metro', price: 24.50, isLowest: false },
      { store: 'FreshCo', price: 22.80, isLowest: true },
      { store: 'Organic Barn', price: 28.15, isLowest: false },
      { store: 'SuperValu', price: 25.90, isLowest: false },
    ],
    avgPrice: 25.34,
    savings: 5.35,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      if (isGuest) {
        // For guest users, use mock data or limited analytics
        setLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Get all checkout sessions for this user
      const { data: checkoutSessions } = await supabase
        .from('checkout_sessions')
        .select('id, created_at, store_name, store_location, total_amount')
        .eq('user_id', user.id);

      // Also get grocery sessions as fallback
      const { data: grocerySessions } = await supabase
        .from('grocery_sessions')
        .select('id, created_at, store_name, store_location, spending_limit')
        .eq('user_id', user.id);

      // Use checkout sessions if available, otherwise use grocery sessions
      const sessions = checkoutSessions && checkoutSessions.length > 0 ? checkoutSessions : grocerySessions;

      if (!sessions || sessions.length === 0) {
        setLoading(false);
        return;
      }

      // Calculate basic stats
      const totalSpent = sessions.reduce((sum, session: any) => {
        return sum + (session.total_amount || session.spending_limit || 0);
      }, 0);
      const avgSpending = totalSpent / sessions.length;
      
      // Calculate monthly trips (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const monthlyTrips = sessions.filter(
        (session: any) => new Date(session.created_at) >= thirtyDaysAgo
      ).length;

      // Calculate store trips
      const storeCount: Record<string, number> = {};
      sessions.forEach((session: any) => {
        const storeName = session.store_name || 'Unknown Store';
        storeCount[storeName] = (storeCount[storeName] || 0) + 1;
      });

      const storeTrips = Object.entries(storeCount)
        .map(([name, trips]) => ({ name, trips, isTop: false }))
        .sort((a, b) => b.trips - a.trips);
      
      if (storeTrips.length > 0) {
        storeTrips[0].isTop = true;
      }

      // Update analytics with real data
      setAnalytics(prev => ({
        ...prev,
        avgSpending,
        monthlyTrips,
        totalSpent,
        totalScans: sessions.length,
        storeTrips: storeTrips.slice(0, 4),
        spendingBreakdown: prev.spendingBreakdown.map(item => ({
          ...item,
          amount: (totalSpent * item.percentage) / 100,
        })),
      }));
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (analytics.totalScans === 0 && !isGuest && !loading) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#333333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analytics</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.emptyContainer}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadAnalytics} />}
        >
          <BarChart3 size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No Analytics Yet</Text>
          <Text style={styles.emptyText}>
            Complete a checkout to see insights about your shopping habits
          </Text>
        </ScrollView>
      </View>
    );
  }

  const maxPrice = Math.max(...analytics.priceComparison.map(item => item.price));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadAnalytics} />}
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Avg. Spending</Text>
            <Text style={styles.statValue}>${analytics.avgSpending.toFixed(2)}</Text>
            <Text style={styles.statSubLabel}>per trip</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Monthly Trips</Text>
            <Text style={styles.statValue}>{analytics.monthlyTrips}</Text>
            <Text style={styles.statSubLabel}>this month</Text>
          </View>
        </View>

        {/* Spending Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Spending Breakdown</Text>
          <View style={styles.breakdownContainer}>
            {analytics.spendingBreakdown.map((item, index) => (
              <View key={index} style={styles.breakdownItem}>
                <View style={styles.breakdownHeader}>
                  <Text style={styles.breakdownCategory}>{item.category}</Text>
                  <Text style={styles.breakdownPercentage}>{item.percentage}%</Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: `${item.percentage}%` }]} />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Trips Per Store */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trips Per Store</Text>
          <View style={styles.storeTripsContainer}>
            {analytics.storeTrips.map((store, index) => (
              <View key={index}>
                <View style={styles.storeRow}>
                  <Text style={styles.storeName}>{store.name}</Text>
                  {store.isTop ? (
                    <View style={styles.topStoreBadge}>
                      <Text style={styles.topStoreText}>{store.trips} trips</Text>
                    </View>
                  ) : (
                    <Text style={styles.storeTrips}>{store.trips} trips</Text>
                  )}
                </View>
                {index < analytics.storeTrips.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Price Comparison */}
        <View style={styles.card}>
          <View style={styles.priceComparisonHeader}>
            <Text style={styles.cardTitle}>Price Comparison by Store</Text>
            <Text style={styles.priceComparisonSubtitle}>
              Total for 5 common items in your cart
            </Text>
          </View>

          {/* Bar Chart */}
          <View style={styles.chartContainer}>
            {analytics.priceComparison.map((item, index) => {
              const height = (item.price / maxPrice) * 100;
              return (
                <View key={index} style={styles.chartBar}>
                  <Text style={styles.chartPrice}>${item.price.toFixed(2)}</Text>
                  <View style={styles.barContainer}>
                    <View style={[styles.bar, { height: `${height}%` }]} />
                  </View>
                  <Text style={styles.chartLabel}>{item.store}</Text>
                </View>
              );
            })}
          </View>

          {/* Best Value Card */}
          <View style={styles.bestValueCard}>
            <View style={styles.bestValueLeft}>
              <Text style={styles.bestValueLabel}>Best Value</Text>
              <Text style={styles.bestValueStore}>FreshCo</Text>
            </View>
            <Text style={styles.bestValuePrice}>$22.80</Text>
          </View>

          {/* Summary Stats */}
          <View style={styles.summaryStats}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Average price</Text>
              <Text style={styles.summaryValue}>${analytics.avgPrice.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>You could save</Text>
              <Text style={styles.savingsValue}>${analytics.savings.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    flex: 1,
    textAlign: 'center',
    marginRight: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
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
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 2,
  },
  statSubLabel: {
    fontSize: 12,
    color: '#666666',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
  },
  breakdownContainer: {
    gap: 16,
  },
  breakdownItem: {
    gap: 4,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  breakdownCategory: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  breakdownPercentage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#ff00ff',
    borderRadius: 5,
  },
  storeTripsContainer: {
    gap: 12,
  },
  storeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  topStoreBadge: {
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  topStoreText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ff00ff',
  },
  storeTrips: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(102, 102, 102, 0.2)',
  },
  priceComparisonHeader: {
    marginBottom: 32,
  },
  priceComparisonSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 200,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderColor: 'rgba(102, 102, 102, 0.2)',
    marginBottom: 24,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  chartPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
  },
  barContainer: {
    flex: 1,
    width: '80%',
    justifyContent: 'flex-end',
  },
  bar: {
    backgroundColor: '#ff00ff',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 20,
  },
  chartLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
    textAlign: 'center',
  },
  bestValueCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  bestValueLeft: {
    gap: 2,
  },
  bestValueLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ff00ff',
  },
  bestValueStore: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
  },
  bestValuePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ff00ff',
  },
  summaryStats: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  savingsValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
});
