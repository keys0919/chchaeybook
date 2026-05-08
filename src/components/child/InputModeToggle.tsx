import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ChildColors, Spacing, Radius } from '../../design/tokens';
import { TextStyle } from '../../design/typography';
import type { CardInputMode } from '../../types/card.types';

interface Props {
  activeMode: CardInputMode;
  availableModes: CardInputMode[];
  onChangeMode: (mode: CardInputMode) => void;
}

const MODE_LABELS: Record<CardInputMode, string> = {
  text: '✏️ 글쓰기',
  voice: '🎙 녹음',
  photo: '📷 사진',
};

export function InputModeToggle({ activeMode, availableModes, onChangeMode }: Props) {
  if (availableModes.length <= 1) return null;
  return (
    <View style={styles.row}>
      {(['text', 'voice', 'photo'] as CardInputMode[]).map((mode) => {
        const isAvailable = availableModes.includes(mode);
        const isActive = activeMode === mode;
        return (
          <TouchableOpacity
            key={mode}
            style={[styles.chip, isActive && styles.chipActive, !isAvailable && styles.chipDisabled]}
            onPress={() => isAvailable && onChangeMode(mode)}
            disabled={!isAvailable}
            accessibilityState={{ selected: isActive, disabled: !isAvailable }}
          >
            <Text
              style={[
                styles.label,
                isActive && styles.labelActive,
                !isAvailable && styles.labelDisabled,
              ]}
            >
              {MODE_LABELS[mode]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: ChildColors.divider,
    backgroundColor: ChildColors.surface1,
  },
  chipActive: { borderColor: ChildColors.primary, backgroundColor: ChildColors.primaryLight },
  chipDisabled: { opacity: 0.4 },
  label: { ...TextStyle.caption, color: ChildColors.textSecondary },
  labelActive: { color: ChildColors.primary },
  labelDisabled: { color: ChildColors.textTertiary },
});
