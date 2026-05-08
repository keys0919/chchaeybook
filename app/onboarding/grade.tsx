// A-3 학년 선택 — ProgressDot 2/3 / 스킵 가능
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
import { useOnboardingStore } from '../../src/stores/onboarding.store';

const GRADES = ['1학년', '2학년', '3학년', '4학년', '5학년', '6학년'];

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
    width: 6, height: 6,
    borderWidth: 1, borderColor: ParentColors.divider,
    backgroundColor: 'transparent', marginVertical: 1,
  },
});

export default function GradeScreen() {
  const router = useRouter();
  const { nickname, setGrade } = useOnboardingStore();
  const [selected, setSelected] = useState<string | null>(null);

  function handleNext(grade: string | null) {
    setGrade(grade);
    router.push('/onboarding/level-assessment');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
        <ProgressDots current={2} total={3} />

        <View style={{ height: Spacing.lg }} />

        <Text style={styles.heading}>{nickname}는 몇 학년인가요?</Text>
        <Text style={styles.sub}>학년을 알면 딱 맞는 단계를 추천해드려요</Text>

        <View style={{ height: Spacing.md }} />

        <View style={styles.grid}>
          {GRADES.map((grade) => (
            <TouchableOpacity
              key={grade}
              style={[styles.gradeChip, selected === grade && styles.gradeChipSelected]}
              onPress={() => setSelected(grade)}
              accessibilityRole="button"
              accessibilityState={{ selected: selected === grade }}
            >
              <Text
                style={[
                  styles.gradeText,
                  selected === grade && styles.gradeTextSelected,
                ]}
              >
                {grade}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.ctaArea}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => handleNext(selected)}
          accessibilityLabel="다음"
        >
          <Text style={styles.primaryButtonText}>다음</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tertiaryButton}
          onPress={() => handleNext(null)}
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
  content: {
    padding: Spacing['2xl'],
    paddingTop: Spacing.xl,
  },
  heading: { ...TextStyle.heading1, color: ParentColors.textPrimary },
  sub: { ...TextStyle.body, color: ParentColors.textSecondary, marginTop: Spacing.sm },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  gradeChip: {
    height: ComponentSize.touchTargetParent,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: ParentColors.divider,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ParentColors.background,
  },
  gradeChipSelected: {
    borderWidth: 2,
    borderColor: ParentColors.primary,
    backgroundColor: ParentColors.primaryLight,
  },
  gradeText: { ...TextStyle.label, color: ParentColors.textPrimary },
  gradeTextSelected: { color: ParentColors.primary },
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
  primaryButtonText: { ...ModeTypography.buttonLabel, color: ParentColors.textOnPrimary },
  tertiaryButton: {
    height: ComponentSize.touchTargetParent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tertiaryText: { ...TextStyle.label, color: ParentColors.textSecondary },
});
