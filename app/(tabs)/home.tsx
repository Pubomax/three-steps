import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { QrCode, ShoppingCart, CheckCircle, TrendingUp, Clock, Store, ShoppingBag } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import StartGroceryFlow from '@/components/StartGroceryFlow';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

type CheckoutSession = {
  id: string;
  total_amount: number;
  item_count: number;
  completed_at: string;
  store_name: string | null;
  store_location: string | null;
};

export default function HomeScreen() {
  const [showStartFlow, setShowStartFlow] = useState(false);
  const [recentTrips, setRecentTrips] = useState<CheckoutSession[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, isGuest } = useAuth();

  useEffect(() => {
    loadRecentTrips();
  }, []);

  const loadRecentTrips = async () => {
    setLoading(true);
    try {
      if (isGuest) {
        // For guest users, we don't have persistent history
        setRecentTrips([]);
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('checkout_sessions')
          .select('id, total_amount, item_count, completed_at, store_name, store_location')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(3);

        if (error) throw error;
        setRecentTrips(data || []);
      }
    } catch (error) {
      console.error('Error loading recent trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGroceryStarted = (sessionId: string) => {
    setShowStartFlow(false);
    router.push('/(tabs)/grocery');
  };

  const getUserName = () => {
    if (isGuest) return 'Guest';
    if (user?.email) {
      const name = user.email.split('@')[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return 'User';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStoreIcon = (storeName: string | null) => {
    // Return different colored icons for different stores
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
    const hash = storeName ? storeName.length % colors.length : 0;
    return colors[hash];
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadRecentTrips} />}
      >
        {/* Header with Profile */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.profilePicture}>
              <Text style={styles.profileInitial}>{getUserName().charAt(0)}</Text>
            </View>
            <Text style={styles.welcomeText}>Welcome back, {getUserName()}!</Text>
          </View>
        </View>

        {/* Start Scanning Card */}
        <View style={styles.startScanningCard}>
          <View style={styles.scanIconContainer}>
            <QrCode size={48} color="#ff00ff" />
          </View>
          <Text style={styles.startScanningTitle}>Start Grocery Session</Text>
          <Text style={styles.startScanningDescription}>
            Tap here to start scanning items and track your spending in real-time.
          </Text>
          <TouchableOpacity
            style={styles.startScanningButton}
            onPress={() => setShowStartFlow(true)}
          >
            <Text style={styles.startScanningButtonText}>Start Scanning</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Trips */}
        <Text style={styles.sectionTitle}>Recent Trips</Text>
        <View style={styles.recentTripsContainer}>
          {recentTrips.length === 0 ? (
            <View style={styles.emptyTrips}>
              <ShoppingBag size={32} color="#9ca3af" />
              <Text style={styles.emptyTripsText}>No recent trips</Text>
              <Text style={styles.emptyTripsSubtext}>Start your first grocery session!</Text>
            </View>
          ) : (
            recentTrips.map((trip) => (
              <View key={trip.id} style={styles.tripCard}>
                <View style={styles.tripCardLeft}>
                  <View style={[styles.storeIcon, { backgroundColor: getStoreIcon(trip.store_name) }]}>
                    <Store size={24} color="#fff" />
                  </View>
                  <View style={styles.tripInfo}>
                    <Text style={styles.storeName}>
                      {trip.store_name || 'Unknown Store'}
                    </Text>
                    <Text style={styles.tripDate}>{formatDate(trip.completed_at)}</Text>
                  </View>
                </View>
                <Text style={styles.tripAmount}>${trip.total_amount.toFixed(2)}</Text>
              </View>
            ))
          )}
        </View>

        {/* Features Section */}
        <View style={styles.featuresGrid}>
          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <ShoppingCart size={24} color="#ff00ff" />
            </View>
            <Text style={styles.featureTitle}>Track Your Cart</Text>
            <Text style={styles.featureDescription}>
              Add items as you shop and stay within budget
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <CheckCircle size={24} color="#ff00ff" />
            </View>
            <Text style={styles.featureTitle}>Set Spending Limits</Text>
            <Text style={styles.featureDescription}>
              Get alerts when you're approaching your budget
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <TrendingUp size={24} color="#ff00ff" />
            </View>
            <Text style={styles.featureTitle}>View Analytics</Text>
            <Text style={styles.featureDescription}>
              Track spending patterns and shopping habits
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Clock size={24} color="#ff00ff" />
            </View>
            <Text style={styles.featureTitle}>Purchase History</Text>
            <Text style={styles.featureDescription}>
              Review past shopping trips and receipts
            </Text>
          </View>
        </View>
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
    backgroundColor: '#f5f7f8',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Account for tab bar
  },
  header: {
    backgroundColor: '#f5f7f8',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ff00ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
  },
  startScanningCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  scanIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ff00ff10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  startScanningTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  startScanningDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  startScanningButton: {
    backgroundColor: '#ff00ff',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
    shadowColor: '#ff00ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startScanningButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  recentTripsContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    gap: 8,
  },
  emptyTrips: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyTripsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyTripsSubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 72,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  tripCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  storeIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  tripDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  tripAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  featuresGrid: {
    marginHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});
