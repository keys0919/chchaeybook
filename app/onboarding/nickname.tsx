// A-2 별명 입력 — ProgressDot 1/3
import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ParentColors, Spacing, Radius, ComponentSize } from '../../src/design/tokens';
import { TextStyle, ModeTypography } from '../../src/design/typography';
import { useOnboardingStore } from '../../src/stores/onboarding.store';

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <View style={dotStyles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[dotStyles.dot, i < current ? dotStyles.dotActive : dotStyles.dotInactive]}
        />
      ))}
    </View>
  );
}

const dotStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  dot: {
    borderRadius: Radius.full,
  },
  dotActive: {
    width: 8,
    height: 8,
    backgroundColor: ParentColors.primary,
  },
  dotInactive: {
    width: 6,
    height: 6,
    borderWidth: 1,
    borderColor: ParentColors.divider,
    backgroundColor: 'transparent',
    marginVertical: 1,
  },
});

export default function NicknameScreen() {
  const router = useRouter();
  const { nickname, setNickname } = useOnboardingStore();
  const [value, setValue] = useState(nickname);
  const inputRef = useRef<TextInput>(null);

  function handleNext() {
    if (!value.trim()) return;
    setNickname(value.trim());
    router.push('/onboarding/grade');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          <ProgressDots current={1} total={3} />

          <View style={{ height: Spacing.lg }} />

          <Text style={styles.heading}>아이의 별명을 알려주세요</Text>
          <Text style={styles.sub}>실명 대신 별명을 써도 괜찮아요</Text>

          <View style={{ height: Spacing.md }} />

          <TextInput
            ref={inputRef}
            style={styles.input}
            value={value}
            onChangeText={setValue}
            placeholder="별명 입력"
            placeholderTextColor={ParentColors.textTertiary}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleNext}
            maxLength={10}
          />
        </View>

        <View style={styles.ctaArea}>
          <TouchableOpacity
            style={[styles.primaryButton, !value.trim() && styles.primaryButtonDisabled]}
            onPress={handleNext}
            disabled={!value.trim()}
            accessibilityLabel="다음"
          >
            <Text style={styles.primaryButtonText}>다음</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ParentColors.background,
  },
  flex: { flex: 1 },
  container: {
    flex: 1,
    padding: Spacing['2xl'],
    paddingTop: Spacing.xl,
  },
  heading: {
    ...TextStyle.heading1,
    color: ParentColors.textPrimary,
  },
  sub: {
    ...TextStyle.body,
    color: ParentColors.textSecondary,
    marginTop: Spacing.sm,
  },
  input: {
    height: ComponentSize.inputHeight,
    backgroundColor: ParentColors.surface2,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    ...TextStyle.body,
    color: ParentColors.textPrimary,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  ctaArea: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  primaryButton: {
    height: ComponentSize.buttonHeight,
    backgroundColor: ParentColors.primary,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.38,
  },
  primaryButtonText: {
    ...ModeTypography.buttonLabel,
    color: ParentColors.textOnPrimary,
  },
});
