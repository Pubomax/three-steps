import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { ShoppingCart, CheckCircle, TrendingUp, Clock, MessageCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import StartGroceryFlow from '@/components/StartGroceryFlow';

export default function HomeScreen() {
  const [showStartFlow, setShowStartFlow] = useState(false);
  const router = useRouter();

  const handleGroceryStarted = (sessionId: string) => {
    setShowStartFlow(false);
    router.push(`/grocery-session/${sessionId}`);
  };

  const handleFeedback = async () => {
    const email = 'feedback@threesteps.app';
    const subject = 'Three Steps MVP Feedback';
    const body = 'Hi! Here is my feedback:\n\n';

    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      } else {
        Alert.alert(
          'Email Not Available',
          `Please send your feedback to: ${email}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        `Please send your feedback to: ${email}`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Grocery Tracker</Text>
          <Text style={styles.subtitle}>Smart shopping made simple</Text>
        </View>

        <View style={styles.featuresSection}>
          <View style={styles.featureItem}>
            <View style={styles.iconCircle}>
              <ShoppingCart size={24} color="#10b981" />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Track Your Cart</Text>
              <Text style={styles.featureDescription}>
                Add items as you shop and stay within budget
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.iconCircle}>
              <CheckCircle size={24} color="#10b981" />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Set Spending Limits</Text>
              <Text style={styles.featureDescription}>
                Get alerts when you're approaching your budget
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.iconCircle}>
              <TrendingUp size={24} color="#10b981" />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>View Analytics</Text>
              <Text style={styles.featureDescription}>
                Track spending patterns and shopping habits
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.iconCircle}>
              <Clock size={24} color="#10b981" />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Purchase History</Text>
              <Text style={styles.featureDescription}>
                Review past shopping trips and receipts
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={() => setShowStartFlow(true)}>
          <Text style={styles.startButtonText}>Start Grocery</Text>
        </TouchableOpacity>

        <View style={styles.feedbackSection}>
          <Text style={styles.feedbackTitle}>Help Us Improve</Text>
          <Text style={styles.feedbackDescription}>
            This is an early MVP. Your feedback helps us build a better app!
          </Text>
          <TouchableOpacity style={styles.feedbackButton} onPress={handleFeedback}>
            <MessageCircle size={20} color="#10b981" />
            <Text style={styles.feedbackButtonText}>Send Feedback</Text>
          </TouchableOpacity>
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
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
    marginTop: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '400',
  },
  featuresSection: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
    paddingTop: 4,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
  },
  startButton: {
    backgroundColor: '#10b981',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  feedbackSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  feedbackDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  feedbackButton: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#10b981',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  feedbackButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
});
