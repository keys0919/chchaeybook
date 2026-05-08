import { View, Text, StyleSheet } from 'react-native';
import { ChildColors, Radius } from '../../design/tokens';
import { TextStyle } from '../../design/typography';

interface Props {
  elapsed: number;
  maxDuration?: number;
  warningThreshold?: number;
}

export function TimerCircle({ elapsed, maxDuration = 60, warningThreshold = 50 }: Props) {
  const remaining = Math.max(0, maxDuration - elapsed);
  const isWarning = elapsed >= warningThreshold;

  return (
    <View style={[styles.circle, isWarning && styles.circleWarning]}>
      <Text style={[styles.text, isWarning && styles.textWarning]}>{remaining}s</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: ChildColors.divider,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ChildColors.surface1,
  },
  circleWarning: {
    borderColor: '#FF5C5C',
    backgroundColor: '#FFF0F0',
  },
  text: { ...TextStyle.label, color: ChildColors.textPrimary },
  textWarning: { color: '#FF5C5C', fontWeight: '700' },
});
