import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert, useWindowDimensions, Image } from 'react-native';
import { ShoppingCart, CheckCircle, TrendingUp, Clock, MessageCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import StartGroceryFlow from '@/components/StartGroceryFlow';
import { useIsIPad } from '@/hooks/useIsIPad';

export default function HomeScreen() {
  const [showStartFlow, setShowStartFlow] = useState(false);
  const router = useRouter();
  const isIPad = useIsIPad();
  const { width } = useWindowDimensions();

  const handleGroceryStarted = (sessionId: string) => {
    setShowStartFlow(false);
    router.push(`/grocery-session/${sessionId}`);
  };

  const handleFeedback = async () => {
    const email = 'feedback@strago.app';
    const subject = 'Strago MVP Feedback';
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
      <ScrollView style={styles.scrollView} contentContainerStyle={[
        styles.scrollContent,
        isIPad && styles.scrollContentIPad,
        isIPad && width > 900 && styles.scrollContentIPadLarge
      ]}>
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={[styles.logo, isIPad && styles.logoIPad]}
            resizeMode="contain"
          />
          <Text style={[styles.appName, isIPad && styles.appNameIPad]}>Three Steps</Text>
          <Text style={[styles.subtitle, isIPad && styles.subtitleIPad]}>Smart shopping made simple</Text>
        </View>

        <View style={[styles.featuresSection, isIPad && styles.featuresSectionIPad]}>
          <View style={[styles.featureItem, isIPad && styles.featureItemIPad]}>
            <View style={[styles.iconCircle, isIPad && styles.iconCircleIPad]}>
              <ShoppingCart size={isIPad ? 32 : 24} color="#ff00ff" />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Track Your Cart</Text>
              <Text style={styles.featureDescription}>
                Add items as you shop and stay within budget
              </Text>
            </View>
          </View>

          <View style={[styles.featureItem, isIPad && styles.featureItemIPad]}>
            <View style={styles.iconCircle}>
              <CheckCircle size={isIPad ? 32 : 24} color="#ff00ff" />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Set Spending Limits</Text>
              <Text style={styles.featureDescription}>
                Get alerts when you're approaching your budget
              </Text>
            </View>
          </View>

          <View style={[styles.featureItem, isIPad && styles.featureItemIPad]}>
            <View style={styles.iconCircle}>
              <TrendingUp size={isIPad ? 32 : 24} color="#ff00ff" />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>View Analytics</Text>
              <Text style={styles.featureDescription}>
                Track spending patterns and shopping habits
              </Text>
            </View>
          </View>

          <View style={[styles.featureItem, isIPad && styles.featureItemIPad]}>
            <View style={styles.iconCircle}>
              <Clock size={isIPad ? 32 : 24} color="#ff00ff" />
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
            <MessageCircle size={20} color="#ff00ff" />
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
  scrollContentIPad: {
    padding: 48,
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  scrollContentIPadLarge: {
    maxWidth: 1200,
  },
  header: {
    marginBottom: 32,
    marginTop: 16,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  logoIPad: {
    width: 160,
    height: 160,
    marginBottom: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  appNameIPad: {
    fontSize: 40,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '400',
    textAlign: 'center',
  },
  subtitleIPad: {
    fontSize: 20,
  },
  featuresSection: {
    marginBottom: 32,
  },
  featuresSectionIPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  featureItemIPad: {
    flex: 1,
    minWidth: '45%',
    marginBottom: 0,
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
  iconCircleIPad: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
    backgroundColor: '#ff00ff',
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
    borderColor: '#ff00ff',
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
    color: '#ff00ff',
  },
});
