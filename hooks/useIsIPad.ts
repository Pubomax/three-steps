import { Platform, Dimensions } from 'react-native';

export function useIsIPad() {
  if (Platform.OS !== 'ios') {
    return false;
  }
  
  const { width, height } = Dimensions.get('window');
  const aspectRatio = height / width;
  
  // iPad aspect ratios are typically between 1.3 and 1.4
  // iPhones are typically > 1.5
  return aspectRatio < 1.5 && Math.min(width, height) >= 768;
}

export function useResponsiveValue<T>(phoneValue: T, tabletValue: T): T {
  const isIPad = useIsIPad();
  return isIPad ? tabletValue : phoneValue;
}
