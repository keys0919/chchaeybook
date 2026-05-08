// 0-2 체험 카드 — 비로그인 Level 1 카드 1장 (저장 없음)
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
import { ChildColors, Spacing, Radius, Shadow, ComponentSize } from '../src/design/tokens';
import { TextStyle, ModeTypography } from '../src/design/typography';

const EXPERIENCE_CARD = {
  question: '이 책에서 가장 기억에 남는 장면은\n___ 장면이에요.',
  hints: ['신나는', '슬픈', '무서운', '재미있는', '아름다운'],
  starter: '나는',
};

export default function ExperienceScreen() {
  const router = useRouter();
  const [selectedHint, setSelectedHint] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const preview = selectedHint
    ? `이 책에서 가장 기억에 남는 장면은 ${selectedHint} 장면이에요.`
    : null;

  function handleComplete() {
    setCompleted(true);
  }

  if (completed) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.completedContainer}>
          <View style={styles.stampCircle}>
            <Text style={styles.stampEmoji}>✏️</Text>
          </View>
          <Text style={styles.completedTitle}>한 문장을 끝까지 썼어요!</Text>
          <Text style={styles.completedDesc}>
            아이랑 이렇게 써볼 수 있어요.{'\n'}
            지금 시작해볼까요?
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/role')}
          >
            <Text style={styles.primaryButtonText}>시작하기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tertiaryButton}
            onPress={() => {
              setCompleted(false);
              setSelectedHint(null);
            }}
          >
            <Text style={styles.tertiaryButtonText}>다시 해보기</Text>
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
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => router.push('/role')}
          accessibilityLabel="건너뛰기"
        >
          <Text style={styles.skipText}>건너뛰기</Text>
        </TouchableOpacity>

        {/* 카드 컨테이너 */}
        <View style={styles.card}>
          <Text style={styles.cardQuestion}>{EXPERIENCE_CARD.question}</Text>

          <View style={{ height: Spacing.md }} />

          {/* 힌트 칩 그리드 */}
          <View style={styles.chipGrid}>
            {EXPERIENCE_CARD.hints.map((hint) => (
              <TouchableOpacity
                key={hint}
                style={[
                  styles.chip,
                  selectedHint === hint && styles.chipSelected,
                ]}
                onPress={() => setSelectedHint(hint)}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedHint === hint }}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedHint === hint && styles.chipTextSelected,
                  ]}
                >
                  {hint}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 문장 미리보기 */}
          {preview ? (
            <>
              <View style={{ height: Spacing.md }} />
              <View style={styles.previewBox}>
                <Text style={styles.previewText}>{preview}</Text>
              </View>
            </>
          ) : (
            <>
              <View style={{ height: Spacing.md }} />
              <View style={styles.previewBoxEmpty}>
                <Text style={styles.previewEmptyText}>
                  단어를 선택하면 문장이 완성돼요
                </Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* 하단 CTA */}
      <View style={styles.ctaArea}>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            !selectedHint && styles.primaryButtonDisabled,
          ]}
          onPress={handleComplete}
          disabled={!selectedHint}
          accessibilityLabel="완성"
        >
          <Text style={styles.primaryButtonText}>완성!</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ChildColors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: Spacing['2xl'],
    paddingTop: Spacing.md,
  },
  skipButton: {
    alignSelf: 'flex-end',
    height: ComponentSize.touchTargetChild,
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  skipText: {
    ...TextStyle.label,
    color: ChildColors.textSecondary,
  },
  card: {
    backgroundColor: ChildColors.surface1,
    borderRadius: Radius.lg,
    padding: 20,
    ...Shadow.level1,
    shadowColor: '#000',
  },
  cardQuestion: {
    ...ModeTypography.childCardQuestion,
    color: ChildColors.textPrimary,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
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
  chipText: {
    ...TextStyle.label,
    color: ChildColors.textPrimary,
  },
  chipTextSelected: {
    color: ChildColors.primary,
  },
  previewBox: {
    backgroundColor: ChildColors.primaryLight,
    borderRadius: Radius.sm,
    padding: Spacing.md,
  },
  previewBoxEmpty: {
    backgroundColor: ChildColors.surface2,
    borderRadius: Radius.sm,
    padding: Spacing.md,
  },
  previewText: {
    ...TextStyle.body,
    color: ChildColors.textPrimary,
    fontWeight: '600',
  },
  previewEmptyText: {
    ...TextStyle.body,
    color: ChildColors.textTertiary,
  },
  ctaArea: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: ChildColors.divider,
    backgroundColor: ChildColors.background,
  },
  primaryButton: {
    height: ComponentSize.buttonHeight,
    backgroundColor: ChildColors.primary,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  primaryButtonDisabled: {
    opacity: 0.38,
  },
  primaryButtonText: {
    ...ModeTypography.buttonLabel,
    color: ChildColors.textOnPrimary,
  },
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
  stampEmoji: {
    fontSize: 28,
  },
  completedTitle: {
    ...TextStyle.heading1,
    color: ChildColors.textPrimary,
    textAlign: 'center',
  },
  completedDesc: {
    ...TextStyle.body,
    color: ChildColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  tertiaryButton: {
    height: ComponentSize.touchTargetParent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tertiaryButtonText: {
    ...TextStyle.label,
    color: ChildColors.textSecondary,
  },
});
