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
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Store,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

type Analytics = {
  totalSpent: number;
  totalScans: number;
  averagePrice: number;
  mostExpensiveProduct: { name: string; price: number } | null;
  cheapestProduct: { name: string; price: number } | null;
  mostScannedStore: { name: string; count: number; totalSpent: number } | null;
  priceIncreases: number;
  priceDecreases: number;
  topProducts: Array<{ name: string; count: number; avgPrice: number }>;
  recommendations: Array<{ type: 'keep' | 'leave'; product: string; reason: string }>;
};

export default function AnalyticsScreen() {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalSpent: 0,
    totalScans: 0,
    averagePrice: 0,
    mostExpensiveProduct: null,
    cheapestProduct: null,
    mostScannedStore: null,
    priceIncreases: 0,
    priceDecreases: 0,
    topProducts: [],
    recommendations: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Get all checkout sessions for this user (including store info)
      const { data: checkoutSessions } = await supabase
        .from('checkout_sessions')
        .select('id, created_at, store_name, store_location, total_amount')
        .eq('user_id', user.id);

      if (!checkoutSessions || checkoutSessions.length === 0) {
        setLoading(false);
        return;
      }

      const sessionIds = checkoutSessions.map((s) => s.id);

      // Get all checkout items (only finalized purchases)
      const { data: scans } = await supabase
        .from('checkout_items')
        .select(
          `
          id,
          price,
          quantity,
          product_id,
          session_id,
          products (
            name
          )
        `
        )
        .in('session_id', sessionIds);

      if (!scans || scans.length === 0) {
        setLoading(false);
        return;
      }

      // Calculate totals accounting for quantity
      const totalSpent = scans.reduce((sum, scan) => sum + scan.price * scan.quantity, 0);
      const totalItems = scans.reduce((sum, scan) => sum + scan.quantity, 0);
      const averagePrice = totalSpent / totalItems;

      const sortedByPrice = [...scans].sort((a, b) => b.price - a.price);
      const mostExpensiveProduct = sortedByPrice[0]
        ? {
            name: (sortedByPrice[0].products as any)?.name || 'Unknown',
            price: sortedByPrice[0].price,
          }
        : null;
      const cheapestProduct = sortedByPrice[sortedByPrice.length - 1]
        ? {
            name: (sortedByPrice[sortedByPrice.length - 1].products as any)?.name || 'Unknown',
            price: sortedByPrice[sortedByPrice.length - 1].price,
          }
        : null;

      // Calculate store statistics from checkout sessions
      const storeCount: Record<string, number> = {};
      const storeSpending: Record<string, number> = {};

      checkoutSessions.forEach((session) => {
        const storeName = session.store_name || 'Unknown Store';
        storeCount[storeName] = (storeCount[storeName] || 0) + 1;
        storeSpending[storeName] = (storeSpending[storeName] || 0) + (session.total_amount || 0);
      });

      const mostScannedStoreEntry = Object.entries(storeCount).sort((a, b) => b[1] - a[1])[0];
      const mostScannedStore = mostScannedStoreEntry
        ? {
            name: mostScannedStoreEntry[0],
            count: mostScannedStoreEntry[1],
            totalSpent: storeSpending[mostScannedStoreEntry[0]]
          }
        : null;

      // Build price history from checkout sessions and items
      const productPriceHistory: Record<
        string,
        Array<{ price: number; purchased_at: string; name: string }>
      > = {};

      scans.forEach((scan) => {
        const productId = scan.product_id;
        const session = checkoutSessions.find((s) => s.id === scan.session_id);

        if (!productPriceHistory[productId]) {
          productPriceHistory[productId] = [];
        }

        // Add entry for each quantity purchased
        for (let i = 0; i < scan.quantity; i++) {
          productPriceHistory[productId].push({
            price: scan.price,
            purchased_at: session?.created_at || new Date().toISOString(),
            name: (scan.products as any)?.name || 'Unknown',
          });
        }
      });

      let priceIncreases = 0;
      let priceDecreases = 0;

      Object.values(productPriceHistory).forEach((history) => {
        const sorted = history.sort(
          (a, b) => new Date(b.purchased_at).getTime() - new Date(a.purchased_at).getTime()
        );
        if (sorted.length > 1) {
          const currentPrice = sorted[0].price;
          const previousPrice = sorted[1].price;
          if (currentPrice > previousPrice) {
            priceIncreases++;
          } else if (currentPrice < previousPrice) {
            priceDecreases++;
          }
        }
      });

      const productCounts: Record<string, { count: number; totalPrice: number; name: string }> =
        {};
      scans.forEach((scan) => {
        const productId = scan.product_id;
        const productName = (scan.products as any)?.name || 'Unknown';
        if (!productCounts[productId]) {
          productCounts[productId] = { count: 0, totalPrice: 0, name: productName };
        }
        productCounts[productId].count += scan.quantity;
        productCounts[productId].totalPrice += scan.price * scan.quantity;
      });

      const topProducts = Object.entries(productCounts)
        .map(([id, data]) => ({
          name: data.name,
          count: data.count,
          avgPrice: data.totalPrice / data.count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const recommendations: Array<{ type: 'keep' | 'leave'; product: string; reason: string }> =
        [];

      topProducts.forEach((product) => {
        const history = Object.values(productPriceHistory).find(
          (h) => h[0]?.name === product.name
        );
        if (history && history.length > 1) {
          const sorted = history.sort(
            (a, b) => new Date(b.purchased_at).getTime() - new Date(a.purchased_at).getTime()
          );
          const currentPrice = sorted[0].price;
          const avgHistoricalPrice =
            sorted.slice(1).reduce((sum, h) => sum + h.price, 0) / (sorted.length - 1);

          if (currentPrice > avgHistoricalPrice * 1.15) {
            recommendations.push({
              type: 'leave',
              product: product.name,
              reason: `Price increased by ${(((currentPrice - avgHistoricalPrice) / avgHistoricalPrice) * 100).toFixed(0)}%`,
            });
          } else if (currentPrice < avgHistoricalPrice * 0.9) {
            recommendations.push({
              type: 'keep',
              product: product.name,
              reason: `Great price, ${(((avgHistoricalPrice - currentPrice) / avgHistoricalPrice) * 100).toFixed(0)}% below average`,
            });
          }
        }

        if (product.avgPrice > averagePrice * 1.5) {
          recommendations.push({
            type: 'leave',
            product: product.name,
            reason: `High cost item, ${((product.avgPrice / averagePrice) * 100 - 100).toFixed(0)}% above average`,
          });
        }
      });

      const uniqueRecommendations = Array.from(
        new Map(recommendations.map((r) => [r.product, r])).values()
      ).slice(0, 6);

      setAnalytics({
        totalSpent,
        totalScans,
        averagePrice,
        mostExpensiveProduct,
        cheapestProduct,
        mostScannedStore,
        priceIncreases,
        priceDecreases,
        topProducts,
        recommendations: uniqueRecommendations,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (analytics.totalScans === 0) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.emptyContainer}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadAnalytics} />}>
        <BarChart3 size={64} color="#d1d5db" />
        <Text style={styles.emptyTitle}>No Analytics Yet</Text>
        <Text style={styles.emptyText}>
          Complete a checkout to see insights about your shopping habits
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadAnalytics} />}>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <DollarSign size={24} color="#ff00ff" />
          </View>
          <Text style={styles.statValue}>${analytics.totalSpent.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <ShoppingBag size={24} color="#3b82f6" />
          </View>
          <Text style={styles.statValue}>{analytics.totalScans}</Text>
          <Text style={styles.statLabel}>Items Purchased</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <TrendingUp size={24} color="#f59e0b" />
          </View>
          <Text style={styles.statValue}>${analytics.averagePrice.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Avg Price</Text>
        </View>

        {analytics.mostScannedStore && (
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Store size={24} color="#8b5cf6" />
            </View>
            <Text style={styles.statValue}>{analytics.mostScannedStore.count}</Text>
            <Text style={styles.statLabel} numberOfLines={1}>{analytics.mostScannedStore.name}</Text>
            <Text style={styles.statSubLabel}>${analytics.mostScannedStore.totalSpent.toFixed(2)} spent</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Price Trends</Text>
        <View style={styles.trendRow}>
          <View style={styles.trendCard}>
            <TrendingUp size={20} color="#ef4444" />
            <Text style={styles.trendValue}>{analytics.priceIncreases}</Text>
            <Text style={styles.trendLabel}>Increases</Text>
          </View>
          <View style={styles.trendCard}>
            <TrendingDown size={20} color="#ff00ff" />
            <Text style={styles.trendValue}>{analytics.priceDecreases}</Text>
            <Text style={styles.trendLabel}>Decreases</Text>
          </View>
        </View>
      </View>

      {analytics.topProducts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Most Purchased</Text>
          {analytics.topProducts.map((product, index) => (
            <View key={index} style={styles.productRow}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productCount}>{product.count} purchases</Text>
              </View>
              <Text style={styles.productPrice}>${product.avgPrice.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      )}

      {analytics.recommendations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Smart Recommendations</Text>
          <Text style={styles.sectionDescription}>
            Based on your shopping habits and price history
          </Text>

          {analytics.recommendations.map((rec, index) => (
            <View
              key={index}
              style={[
                styles.recommendationCard,
                rec.type === 'keep' ? styles.keepCard : styles.leaveCard,
              ]}>
              <View style={styles.recommendationHeader}>
                {rec.type === 'keep' ? (
                  <ThumbsUp size={20} color="#ff00ff" />
                ) : (
                  <ThumbsDown size={20} color="#ef4444" />
                )}
                <Text
                  style={[
                    styles.recommendationBadge,
                    rec.type === 'keep' ? styles.keepBadge : styles.leaveBadge,
                  ]}>
                  {rec.type === 'keep' ? 'KEEP' : 'CONSIDER ALTERNATIVES'}
                </Text>
              </View>
              <Text style={styles.recommendationProduct}>{rec.product}</Text>
              <Text style={styles.recommendationReason}>{rec.reason}</Text>
            </View>
          ))}
        </View>
      )}

      {analytics.mostExpensiveProduct && analytics.cheapestProduct && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Range</Text>

          <View style={styles.priceRangeCard}>
            <View style={styles.priceRangeItem}>
              <Text style={styles.priceRangeLabel}>Most Expensive</Text>
              <Text style={styles.priceRangeProduct}>{analytics.mostExpensiveProduct.name}</Text>
              <Text style={styles.priceRangePrice}>
                ${analytics.mostExpensiveProduct.price.toFixed(2)}
              </Text>
            </View>

            <View style={styles.priceRangeDivider} />

            <View style={styles.priceRangeItem}>
              <Text style={styles.priceRangeLabel}>Most Affordable</Text>
              <Text style={styles.priceRangeProduct}>{analytics.cheapestProduct.name}</Text>
              <Text style={styles.priceRangePrice}>
                ${analytics.cheapestProduct.price.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  statSubLabel: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  trendRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  trendCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  trendValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginVertical: 8,
  },
  trendLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  productCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ff00ff',
  },
  recommendationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
  },
  keepCard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#ff00ff',
  },
  leaveCard: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  recommendationBadge: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  keepBadge: {
    color: '#ff00ff',
  },
  leaveBadge: {
    color: '#ef4444',
  },
  recommendationProduct: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  recommendationReason: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  priceRangeCard: {
    flexDirection: 'row',
    marginTop: 12,
  },
  priceRangeItem: {
    flex: 1,
    alignItems: 'center',
  },
  priceRangeDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
  },
  priceRangeLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  priceRangeProduct: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  priceRangePrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ff00ff',
  },
});
