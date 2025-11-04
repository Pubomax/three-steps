import { useEffect, useMemo, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { X, CheckCircle2 } from 'lucide-react-native';

type Props = {
  visible: boolean;
  total: number;
  items: number;
  store?: string | null;
  onClose: () => void;
  onStartNew: () => void;
  onViewHistory: () => void;
  onViewSummary?: () => void;
};

const { width, height } = Dimensions.get('window');

export default function TripCompletedModal({
  visible,
  total,
  items,
  store,
  onClose,
  onStartNew,
  onViewHistory,
}: Props) {
  const pieces = 60;
  const anims = useMemo(
    () =>
      Array.from({ length: pieces }).map(() => ({
        translateY: new Animated.Value(-40),
        translateX: new Animated.Value(Math.random() * width - width / 2),
        rotate: new Animated.Value(0),
        delay: Math.random() * 400,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      })),
    []
  );

  useEffect(() => {
    if (!visible) return;
    const animations = anims.map(({ translateY, translateX, rotate, delay }) =>
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: height * 0.7,
          duration: 2000 + Math.random() * 1200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
          delay,
        }),
        Animated.timing(translateX, {
          toValue: (Math.random() - 0.5) * width,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
          delay,
        }),
        Animated.timing(rotate, {
          toValue: Math.random() * 2 * Math.PI,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
          delay,
        }),
      ])
    );
    Animated.stagger(8, animations).start();
  }, [visible]);

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <TouchableOpacity onPress={onClose} style={styles.close}>
            <X size={20} color="#374151" />
          </TouchableOpacity>

          {/* Confetti layer */}
          <View pointerEvents="none" style={styles.confettiLayer}>
            {anims.map((p, idx) => (
              <Animated.View
                key={idx}
                style={[
                  styles.confetti,
                  {
                    backgroundColor: p.color,
                    transform: [
                      { translateY: p.translateY },
                      { translateX: p.translateX },
                      { rotate: p.rotate.interpolate({ inputRange: [0, Math.PI * 2], outputRange: ['0rad', `${Math.PI * 2}rad`] }) },
                    ],
                  },
                ]}
              />
            ))}
          </View>

          <View style={styles.iconCircle}>
            <CheckCircle2 size={56} color="#fff" />
          </View>
          <Text style={styles.title}>Shopping Trip Saved!</Text>

          <View style={styles.summaryBox}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Total Spent</Text>
              <Text style={styles.rowValue}>${total.toFixed(2)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Store</Text>
              <Text style={styles.rowValueStrong}>{store || 'Unknown'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Items</Text>
              <Text style={styles.rowValueStrong}>{items}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={onStartNew}>
            <Text style={styles.primaryBtnText}>Start New Session</Text>
          </TouchableOpacity>
          {onViewSummary && (
            <TouchableOpacity style={styles.primaryGhostBtn} onPress={onViewSummary}>
              <Text style={styles.primaryGhostBtnText}>View Summary</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.secondaryBtn} onPress={onViewHistory}>
            <Text style={styles.secondaryBtnText}>View History</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const COLORS = ['#ff00ff', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  close: {
    position: 'absolute',
    top: 14,
    right: 14,
    padding: 6,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  confettiLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 240,
    overflow: 'hidden',
    alignItems: 'center',
  },
  confetti: {
    position: 'absolute',
    top: -20,
    width: 8,
    height: 12,
    borderRadius: 2,
    opacity: 0.9,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#ff00ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },
  summaryBox: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rowLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  rowValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '700',
  },
  rowValueStrong: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: '#ff00ff',
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  primaryGhostBtn: {
    width: '100%',
    backgroundColor: '#ffe6ff',
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryGhostBtnText: {
    color: '#b000b0',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    width: '100%',
    backgroundColor: '#f3e8ff',
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#7c3aed',
    fontSize: 16,
    fontWeight: '700',
  },
});


