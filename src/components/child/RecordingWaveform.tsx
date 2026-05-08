import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { ChildColors } from '../../design/tokens';

interface Props {
  metering: number; // dB, typically -160 to 0
  isRecording: boolean;
}

const BAR_COUNT = 24;
const MIN_H = 4;
const MAX_H = 36;

function dbToNorm(db: number): number {
  return Math.max(0, Math.min(1, (db + 80) / 80));
}

export function RecordingWaveform({ metering, isRecording }: Props) {
  const bars = useRef(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(MIN_H))
  ).current;

  useEffect(() => {
    if (!isRecording) {
      bars.forEach((b) =>
        Animated.timing(b, { toValue: MIN_H, duration: 200, useNativeDriver: false }).start()
      );
      return;
    }
    const norm = dbToNorm(metering);
    bars.forEach((bar) => {
      const jitter = 0.4 + Math.random() * 0.6;
      const h = MIN_H + norm * (MAX_H - MIN_H) * jitter;
      Animated.timing(bar, {
        toValue: Math.max(MIN_H, h),
        duration: 180,
        useNativeDriver: false,
      }).start();
    });
  }, [metering, isRecording]);

  return (
    <View style={styles.container}>
      {bars.map((anim, i) => (
        <Animated.View
          key={i}
          style={[styles.bar, { height: anim }, isRecording && styles.barActive]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: MAX_H + 8,
    gap: 3,
  },
  bar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: ChildColors.divider,
  },
  barActive: {
    backgroundColor: ChildColors.primary,
  },
});
