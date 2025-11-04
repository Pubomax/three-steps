import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const ONBOARDING_KEY = 'onboarding_done';

export default function OnboardingVideo() {
  const player = useRef<Video>(null);
  const router = useRouter();

  const complete = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.videoWrap}>
        <Video
          ref={player}
          source={{ uri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4' }}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
          useNativeControls
        />
      </View>
      <TouchableOpacity style={styles.cta} onPress={complete}>
        <Text style={styles.ctaText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e14', padding: 24, justifyContent: 'center' },
  // Portrait video similar to TikTok
  videoWrap: { backgroundColor: '#000', borderRadius: 12, overflow: 'hidden', marginBottom: 24, aspectRatio: 9/16 },
  video: { width: '100%', height: '100%' },
  cta: { backgroundColor: '#ff00ff', borderRadius: 24, paddingVertical: 14, alignItems: 'center' },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});


