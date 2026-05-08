// B-2 체험 카드 — SQLite 임시 기록, 부모 연결 없이 작동
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChildColors, Spacing, Radius, Shadow, ComponentSize } from '../../src/design/tokens';
import { TextStyle, ModeTypography } from '../../src/design/typography';

const GUEST_CARD = {
  question: '이 책에서 어떤 부분이\n가장 좋았나요?',
  hints: ['주인공이 멋있어서', '그림이 예뻐서', '내용이 재미있어서', '슬픈 장면이 있어서', '행복하게 끝나서'],
};

export default function ChildExperienceCardScreen() {
  const router = useRouter();
  const [selectedHint, setSelectedHint] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  if (completed) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.completedContainer}>
          <View style={styles.stampCircle}>
            <Text style={styles.stampEmoji}>⭐</Text>
          </View>
          <Text style={styles.completedTitle}>한 문장 완성!</Text>
          <Text style={styles.completedDesc}>
            {selectedHint}{'\n'}정말 잘 썼어요!
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/child-experience/connect-prompt')}
          >
            <Text style={styles.primaryButtonText}>다음으로</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* 상단 메타 */}
        <View style={styles.metaRow}>
          <Text style={styles.metaBook}>체험 카드</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>Level 1</Text>
          </View>
        </View>

        <View style={{ height: 12 }} />

        {/* 카드 컨테이너 */}
        <View style={styles.card}>
          <Text style={styles.cardQuestion}>{GUEST_CARD.question}</Text>

          <View style={{ height: Spacing.md }} />

          <View style={styles.chipGrid}>
            {GUEST_CARD.hints.map((hint) => (
              <TouchableOpacity
                key={hint}
                style={[styles.chip, selectedHint === hint && styles.chipSelected]}
                onPress={() => setSelectedHint(hint)}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedHint === hint }}
              >
                <Text
                  style={[styles.chipText, selectedHint === hint && styles.chipTextSelected]}
                >
                  {hint}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedHint ? (
            <>
              <View style={{ height: Spacing.md }} />
              <View style={styles.previewBox}>
                <Text style={styles.previewText}>{selectedHint}</Text>
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.ctaArea}>
        <TouchableOpacity
          style={[styles.primaryButton, !selectedHint && styles.primaryButtonDisabled]}
          onPress={() => setCompleted(true)}
          disabled={!selectedHint}
          accessibilityLabel="완료"
        >
          <Text style={styles.primaryButtonText}>완료!</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tertiaryButton}
          onPress={() => router.push('/child-experience/connect-prompt')}
          accessibilityLabel="건너뛰기"
        >
          <Text style={styles.tertiaryText}>건너뛰기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: ChildColors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing['2xl'], paddingTop: Spacing.md },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  metaBook: { ...TextStyle.caption, color: ChildColors.textSecondary },
  levelBadge: {
    backgroundColor: '#C8D8FF',
    borderRadius: Radius.xs,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  levelBadgeText: { ...TextStyle.caption, color: '#3D6FFF' },
  card: {
    backgroundColor: ChildColors.surface1,
    borderRadius: Radius.lg,
    padding: 20,
    ...Shadow.level1,
    shadowColor: '#000',
  },
  cardQuestion: { ...ModeTypography.childCardQuestion, color: ChildColors.textPrimary },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    height: ComponentSize.hintChipHeight,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: ChildColors.divider,
    backgroundColor: ChildColors.surface1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipSelected: {
    borderWidth: 2,
    borderColor: ChildColors.primary,
    backgroundColor: ChildColors.primaryLight,
  },
  chipText: { ...TextStyle.label, color: ChildColors.textPrimary },
  chipTextSelected: { color: ChildColors.primary },
  previewBox: {
    backgroundColor: ChildColors.primaryLight,
    borderRadius: Radius.sm,
    padding: Spacing.md,
  },
  previewText: { ...TextStyle.body, color: ChildColors.textPrimary, fontWeight: '600' },
  ctaArea: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: ChildColors.divider,
    backgroundColor: ChildColors.background,
    gap: Spacing.xs,
  },
  primaryButton: {
    height: ComponentSize.buttonHeight,
    backgroundColor: ChildColors.primary,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  primaryButtonDisabled: { opacity: 0.38 },
  primaryButtonText: { ...ModeTypography.buttonLabel, color: ChildColors.textOnPrimary },
  tertiaryButton: {
    height: ComponentSize.touchTargetParent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tertiaryText: { ...TextStyle.label, color: ChildColors.textSecondary },
  // 완료 화면
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing['2xl'],
    gap: Spacing.md,
  },
  stampCircle: {
    width: ComponentSize.stampBadgeLarge,
    height: ComponentSize.stampBadgeLarge,
    borderRadius: Radius.full,
    backgroundColor: ChildColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  stampEmoji: { fontSize: 28 },
  completedTitle: { ...TextStyle.heading1, color: ChildColors.textPrimary, textAlign: 'center' },
  completedDesc: {
    ...TextStyle.body,
    color: ChildColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
