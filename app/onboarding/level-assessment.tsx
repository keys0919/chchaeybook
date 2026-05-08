// A-4 쓰기 수준 선택 — ProgressDot 3/3 / 스킵 가능
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ParentColors, Spacing, Radius, ComponentSize } from '../../src/design/tokens';
import { TextStyle, ModeTypography } from '../../src/design/typography';
import {
  useOnboardingStore,
  deriveLevelFromGradeAndAssessment,
} from '../../src/stores/onboarding.store';

const LEVELS = [
  { label: '빈칸을 채우는 것도 어려워요', level: 1 },
  { label: '한 문장은 쓸 수 있어요', level: 2 },
  { label: '두 문장 이상 쓰지만 짧아요', level: 3 },
  { label: '짧은 독서록은 쓸 수 있어요', level: 4 },
  { label: '잘 모르겠어요', level: 1 },
];

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
  row: { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'center' },
  dot: { borderRadius: Radius.full },
  dotActive: { width: 8, height: 8, backgroundColor: ParentColors.primary },
  dotInactive: {
    width: 6, height: 6, borderWidth: 1, borderColor: ParentColors.divider,
    backgroundColor: 'transparent', marginVertical: 1,
  },
});

export default function LevelAssessmentScreen() {
  const router = useRouter();
  const { nickname, grade, setAssessmentLevel, setSelectedLevel } = useOnboardingStore();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  function handleNext(assessmentLevel: number) {
    setAssessmentLevel(assessmentLevel);
    const derived = deriveLevelFromGradeAndAssessment(grade, assessmentLevel);
    setSelectedLevel(derived);
    router.push('/onboarding/level-suggest');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
        <ProgressDots current={3} total={3} />

        <View style={{ height: Spacing.lg }} />

        <Text style={styles.heading}>{nickname}의 독서록 쓰기는{'\n'}어느 정도인가요?</Text>

        <View style={{ height: Spacing.md }} />

        <View style={styles.list}>
          {LEVELS.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.listItem, selectedIndex === i && styles.listItemSelected]}
              onPress={() => setSelectedIndex(i)}
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedIndex === i }}
            >
              <View
                style={[
                  styles.radio,
                  selectedIndex === i && styles.radioSelected,
                ]}
              />
              <Text
                style={[
                  styles.listItemText,
                  selectedIndex === i && styles.listItemTextSelected,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.ctaArea}>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            selectedIndex === null && styles.primaryButtonDisabled,
          ]}
          onPress={() => {
            if (selectedIndex !== null) handleNext(LEVELS[selectedIndex].level);
          }}
          disabled={selectedIndex === null}
          accessibilityLabel="다음"
        >
          <Text style={styles.primaryButtonText}>다음</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tertiaryButton}
          onPress={() => handleNext(1)}
          accessibilityLabel="건너뛰기"
        >
          <Text style={styles.tertiaryText}>건너뛰기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: ParentColors.background },
  flex: { flex: 1 },
  content: { padding: Spacing['2xl'], paddingTop: Spacing.xl },
  heading: { ...TextStyle.heading1, color: ParentColors.textPrimary },
  list: { gap: Spacing.sm },
  listItem: {
    height: ComponentSize.inputHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: ParentColors.divider,
    gap: Spacing.sm,
    backgroundColor: ParentColors.background,
  },
  listItemSelected: {
    borderWidth: 2,
    borderColor: ParentColors.primary,
    backgroundColor: ParentColors.primaryLight,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: ParentColors.divider,
  },
  radioSelected: {
    borderColor: ParentColors.primary,
    backgroundColor: ParentColors.primary,
  },
  listItemText: { ...TextStyle.body, color: ParentColors.textPrimary, flex: 1 },
  listItemTextSelected: { color: ParentColors.textPrimary },
  ctaArea: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.sm,
    gap: Spacing.xs,
  },
  primaryButton: {
    height: ComponentSize.buttonHeight,
    backgroundColor: ParentColors.primary,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonDisabled: { opacity: 0.38 },
  primaryButtonText: { ...ModeTypography.buttonLabel, color: ParentColors.textOnPrimary },
  tertiaryButton: {
    height: ComponentSize.touchTargetParent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tertiaryText: { ...TextStyle.label, color: ParentColors.textSecondary },
});
