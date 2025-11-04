import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function OnboardingWelcome() {
  const router = useRouter();
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 900, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoWrap, { transform: [{ scale }], opacity }]}> 
        <Image source={require('@/assets/images/icon.png')} style={{ width: 140, height: 140 }} />
      </Animated.View>
      <Text style={styles.title}>Welcome to Strago</Text>
      <Text style={styles.subtitle}>Scan • Track • Go</Text>

      <TouchableOpacity style={styles.cta} onPress={() => router.push('/onboarding/video')}>
        <Text style={styles.ctaText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e14', alignItems: 'center', justifyContent: 'center', padding: 24 },
  logoWrap: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,0,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: '#cbd5e1', fontSize: 14, marginBottom: 40 },
  cta: { backgroundColor: '#ff00ff', borderRadius: 24, paddingVertical: 14, paddingHorizontal: 28 },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});


