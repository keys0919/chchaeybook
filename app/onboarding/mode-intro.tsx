// A-6 모드 안내 + onboarding_completed 서버 저장
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ParentColors,
  ChildColors,
  Spacing,
  Radius,
  ComponentSize,
  Shadow,
} from '../../src/design/tokens';
import { TextStyle, ModeTypography } from '../../src/design/typography';
import { useAuthStore } from '../../src/stores/auth.store';
import { useOnboardingStore } from '../../src/stores/onboarding.store';
import {
  ensureParentProfile,
  createChildProfile,
  completeOnboarding,
} from '../../src/services/auth.service';

export default function ModeIntroScreen() {
  const router = useRouter();
  const { session, setChildProfile } = useAuthStore();
  const { nickname, grade, selectedLevel, reset } = useOnboardingStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStart() {
    if (!session) {
      router.replace('/onboarding/login');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await ensureParentProfile(session.user.id);
      const childId = await createChildProfile(
        session.user.id,
        nickname || '아이',
        grade,
        selectedLevel
      );
      await completeOnboarding(childId);
      setChildProfile({
        child_id: childId,
        parent_id: session.user.id,
        nickname: nickname || '아이',
        grade,
        current_level: selectedLevel,
        onboarding_completed: true,
      });
      reset();
      router.replace('/(parent)/home');
    } catch (e: any) {
      setError('저장 중 문제가 생겼어요. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
        <Text style={styles.heading}>이렇게 함께 써요</Text>
        <Text style={styles.sub}>지금은 부모 화면이에요</Text>

        <View style={{ height: Spacing.lg }} />

        {/* 부모 모드 카드 */}
        <View style={styles.parentCard}>
          <View style={styles.cardHeader}>
            <View style={styles.modeBadgeParent}>
              <Text style={styles.modeBadgeText}>부모 모드</Text>
            </View>
          </View>
          <Text style={styles.cardTitle}>아이 기록 확인 &amp; 칭찬</Text>
          <Text style={styles.cardDesc}>
            아이가 쓴 문장을 확인하고{'\n'}칭찬 카드를 보낼 수 있어요
          </Text>
        </View>

        <View style={{ height: Spacing.md }} />

        {/* 아이 모드 카드 */}
        <View style={styles.childCard}>
          <View style={styles.cardHeader}>
            <View style={styles.modeBadgeChild}>
              <Text style={styles.modeBadgeText}>아이 모드</Text>
            </View>
          </View>
          <Text style={styles.cardTitle}>오늘의 한 문장 쓰기</Text>
          <Text style={styles.cardDesc}>
            카드 질문에 답하면서{'\n'}도장을 모을 수 있어요
          </Text>
        </View>

        <View style={{ height: Spacing.md }} />

        <Text style={styles.switchHint}>
          우상단 버튼으로 언제든 모드를 바꿀 수 있어요
        </Text>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}
      </ScrollView>

      <View style={styles.ctaArea}>
        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
          onPress={handleStart}
          disabled={loading}
          accessibilityLabel="시작하기"
        >
          {loading ? (
            <ActivityIndicator color={ParentColors.textOnPrimary} />
          ) : (
            <Text style={styles.primaryButtonText}>시작하기</Text>
          )}
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
  sub: { ...TextStyle.body, color: ParentColors.textSecondary, marginTop: Spacing.xs },
  parentCard: {
    backgroundColor: ParentColors.surface1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    ...Shadow.level1,
    shadowColor: '#000',
  },
  childCard: {
    backgroundColor: ChildColors.background,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: ParentColors.primaryLight,
    ...Shadow.level1,
    shadowColor: '#000',
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  modeBadgeParent: {
    backgroundColor: ParentColors.surface2,
    borderRadius: Radius.xs,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  modeBadgeChild: {
    backgroundColor: ParentColors.primaryLight,
    borderRadius: Radius.xs,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  modeBadgeText: { ...TextStyle.caption, color: ParentColors.textSecondary },
  cardTitle: { ...TextStyle.title, color: ParentColors.textPrimary, marginBottom: Spacing.xs },
  cardDesc: { ...TextStyle.body, color: ParentColors.textSecondary, lineHeight: 24 },
  switchHint: {
    ...TextStyle.caption,
    color: ParentColors.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    ...TextStyle.label,
    color: ParentColors.statusError,
    textAlign: 'center',
    marginTop: Spacing.sm,
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
  primaryButtonDisabled: { opacity: 0.38 },
  primaryButtonText: { ...ModeTypography.buttonLabel, color: ParentColors.textOnPrimary },
});
