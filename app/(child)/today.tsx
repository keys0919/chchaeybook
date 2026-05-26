import { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { BookOpen } from 'lucide-react-native';
import {
  ChildColors,
  Spacing,
  Radius,
  ComponentSize,
  Shadow,
  CopyTokens,
} from '../../src/design/tokens';
import { TextStyle, ModeTypography } from '../../src/design/typography';
import { useProfileStore, LEVEL_UP_THRESHOLD, MAX_LEVEL } from '../../src/stores/profile.store';
import { useSessionStore } from '../../src/stores/session.store';
import { loadMeaningfulDrafts } from '../../src/services/draft.service';
import { getChildWeeklyCount, getChildLevelCount } from '../../src/services/record.service';
import type { Draft } from '../../src/types/db.types';

function draftExpiryLabel(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  return CopyTokens.DRAFT_EXPIRE.replace('{n}', String(days));
}

export default function TodayScreen() {
  const router = useRouter();
  const { profile, levelUp } = useProfileStore();
  const { startSession } = useSessionStore();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [levelCount, setLevelCount] = useState(0);
  const [celebrationLevel, setCelebrationLevel] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const [result, weekly, levelCnt] = await Promise.all([
        Promise.resolve(loadMeaningfulDrafts(profile.child_id)),
        getChildWeeklyCount(profile.child_id),
        getChildLevelCount(profile.child_id, profile.current_level),
      ]);
      setDrafts(result);
      setWeeklyCount(weekly);
      setLevelCount(levelCnt);

      if (levelCnt >= LEVEL_UP_THRESHOLD && profile.current_level < MAX_LEVEL) {
        levelUp();
        setCelebrationLevel(profile.current_level + 1);
      }
    } catch {
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  }, [profile, levelUp]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleNewBook = () => router.push('/write/book-input');

  const handleResume = (draft: Draft) => {
    startSession(draft.book_title, null, draft.level, 1, draft.draft_id);
    router.push('/write/card');
  };

  if (!profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator color={ChildColors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {celebrationLevel !== null ? (
        <Modal transparent animationType="fade" visible>
          <View style={styles.celebrationOverlay}>
            <View style={styles.celebrationCard}>
              <Text style={styles.celebrationEmoji}>🎉</Text>
              <Text style={styles.celebrationTitle}>
                Level {celebrationLevel}에 도착했어요!
              </Text>
              <Text style={styles.celebrationDesc}>
                {celebrationLevel === 2
                  ? '이제 문장 시작어와 함께 써볼까요?'
                  : celebrationLevel === 3
                  ? '이제 두 문장으로 생각을 이어봐요.'
                  : '이제 구조화된 독서록에 도전해봐요!'}
              </Text>
              <TouchableOpacity
                style={styles.celebrationBtn}
                onPress={() => {
                  setCelebrationLevel(null);
                  router.push('/write/book-input');
                }}
              >
                <Text style={styles.celebrationBtnText}>새 독서록 쓰기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.celebrationLaterBtn}
                onPress={() => setCelebrationLevel(null)}
              >
                <Text style={styles.celebrationLaterText}>나중에</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      ) : null}

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.greeting}>안녕, {profile.nickname}!</Text>
        <Text style={styles.subGreeting}>오늘 읽은 책 독서록을 써볼까요?</Text>

        <View style={{ height: Spacing.md }} />

        {!loading ? (
          <View style={styles.progressCard}>
            <View style={styles.progressRow}>
              <View style={styles.progressItem}>
                {weeklyCount === 0 ? (
                  <>
                    <Text style={styles.progressValueZero}>이번 주</Text>
                    <Text style={styles.progressLabel}>첫 기록을 남겨볼까요?</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.progressValue}>{weeklyCount}번</Text>
                    <Text style={styles.progressLabel}>이번 주 기록</Text>
                  </>
                )}
              </View>
              <View style={styles.progressDivider} />
              <View style={styles.progressItem}>
                <Text style={styles.progressValue}>Lv.{profile.current_level}</Text>
                <Text style={styles.progressLabel}>현재 레벨</Text>
              </View>
            </View>
            <View style={{ height: Spacing.sm }} />
            <View style={styles.levelProgressRow}>
              <View style={styles.levelTrack}>
                <View
                  style={[
                    styles.levelFill,
                    levelCount >= LEVEL_UP_THRESHOLD && styles.levelFillReady,
                    { width: `${Math.min((levelCount / LEVEL_UP_THRESHOLD) * 100, 100)}%` as any },
                  ]}
                />
              </View>
            </View>
            <Text style={styles.levelHint}>
              {profile.current_level >= MAX_LEVEL
                ? '최고 레벨 달성! 계속 써봐요 💪'
                : levelCount >= LEVEL_UP_THRESHOLD
                ? '레벨업 완료!'
                : `레벨업까지 ${LEVEL_UP_THRESHOLD - levelCount}번 더`}
            </Text>
          </View>
        ) : null}

        <View style={{ height: Spacing.lg }} />

        {loading ? (
          <ActivityIndicator color={ChildColors.primary} />
        ) : drafts.length === 0 ? (
          <View style={styles.emptyArea}>
            <BookOpen size={64} color={ChildColors.textTertiary} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>{CopyTokens.EMPTY_CHILD_HOME}</Text>
            <Text style={styles.emptyDesc}>책을 읽고 독서록을 남겨요.</Text>
            <View style={{ height: Spacing.lg }} />
            <TouchableOpacity style={styles.newBookBtnLarge} onPress={handleNewBook}>
              <Text style={styles.newBookBtnText}>새 책 시작하기</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.sectionLabel}>이어서 쓰기</Text>
            <View style={{ height: Spacing.sm }} />
            {drafts.map((draft) => (
              <View key={draft.draft_id} style={styles.resumeCard}>
                <Text style={styles.resumeBookTitle} numberOfLines={1}>
                  {draft.book_title}
                </Text>
                {draft.partial_input?.type === 'text' && draft.partial_input.text ? (
                  <Text style={styles.resumeInputSummary} numberOfLines={2}>
                    {draft.partial_input.text}
                  </Text>
                ) : null}
                <View style={styles.resumeFooter}>
                  <Text style={styles.resumeExpiry}>{draftExpiryLabel(draft.expires_at)}</Text>
                </View>
                <TouchableOpacity style={styles.resumeCTA} onPress={() => handleResume(draft)}>
                  <Text style={styles.resumeCTAText}>이어 쓰기</Text>
                </TouchableOpacity>
              </View>
            ))}

            <View style={{ height: Spacing.xl }} />

            <TouchableOpacity style={styles.newBookBtnSecondary} onPress={handleNewBook}>
              <Text style={styles.newBookBtnSecondaryText}>+ 새 책 시작하기</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: ChildColors.background },
  content: { paddingHorizontal: 20, paddingTop: Spacing.xl, paddingBottom: Spacing.xl },
  greeting: { ...TextStyle.heading1, color: ChildColors.textPrimary },
  subGreeting: { ...TextStyle.body, color: ChildColors.textSecondary, marginTop: Spacing.xs },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  emptyArea: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.md },
  emptyTitle: {
    ...TextStyle.title,
    fontWeight: '600',
    color: ChildColors.textPrimary,
    textAlign: 'center',
  },
  emptyDesc: {
    ...TextStyle.body,
    color: ChildColors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  newBookBtnLarge: {
    width: '100%',
    height: ComponentSize.buttonHeight,
    backgroundColor: ChildColors.primary,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newBookBtnText: { ...ModeTypography.buttonLabel, color: ChildColors.textOnPrimary },

  sectionLabel: { ...TextStyle.label, color: ChildColors.textSecondary },
  resumeCard: {
    backgroundColor: ChildColors.surface1,
    borderRadius: Radius.lg,
    padding: 20,
    marginBottom: Spacing.sm,
    ...Shadow.level1,
    shadowColor: '#1A1A1A',
    gap: Spacing.xs,
  },
  resumeBookTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 16 * 1.6,
    color: ChildColors.textPrimary,
  },
  resumeInputSummary: {
    ...TextStyle.body,
    color: ChildColors.textSecondary,
    lineHeight: 16 * 1.6,
  },
  resumeFooter: { flexDirection: 'row', justifyContent: 'flex-end' },
  resumeExpiry: { ...TextStyle.caption, color: ChildColors.statusWarning },
  resumeCTA: {
    height: ComponentSize.buttonHeight,
    backgroundColor: ChildColors.primary,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  resumeCTAText: { ...ModeTypography.buttonLabel, color: ChildColors.textOnPrimary },

  progressCard: {
    backgroundColor: ChildColors.surface1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    ...Shadow.level1,
    shadowColor: '#1A1A1A',
  },
  progressRow: { flexDirection: 'row', alignItems: 'center' },
  progressItem: { flex: 1, alignItems: 'center', gap: 2 },
  progressValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: ChildColors.textPrimary,
    lineHeight: 24,
  },
  progressValueZero: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: ChildColors.textSecondary,
    lineHeight: 20,
  },
  progressLabel: { ...TextStyle.caption, color: ChildColors.textTertiary },
  progressDivider: { width: 1, height: 32, backgroundColor: ChildColors.divider },
  levelProgressRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  levelTrack: {
    flex: 1,
    height: 6,
    backgroundColor: ChildColors.surface2,
    borderRadius: 3,
    overflow: 'hidden',
  },
  levelFill: {
    height: '100%',
    backgroundColor: ChildColors.primary,
    borderRadius: 3,
  },
  levelFillReady: { backgroundColor: ChildColors.statusSuccess },
  levelHint: {
    ...TextStyle.caption,
    color: ChildColors.textSecondary,
    marginTop: Spacing.xs,
  },

  newBookBtnSecondary: {
    height: ComponentSize.buttonHeight,
    backgroundColor: ChildColors.primaryLight,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newBookBtnSecondaryText: { ...ModeTypography.buttonLabel, color: ChildColors.primary },

  celebrationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  celebrationCard: {
    backgroundColor: ChildColors.surface1,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    width: '100%',
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadow.level1,
    shadowColor: '#1A1A1A',
  },
  celebrationEmoji: { fontSize: 56 },
  celebrationTitle: {
    ...TextStyle.heading1,
    color: ChildColors.textPrimary,
    textAlign: 'center',
  },
  celebrationDesc: {
    ...TextStyle.body,
    color: ChildColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  celebrationBtn: {
    width: '100%',
    height: ComponentSize.buttonHeight,
    backgroundColor: ChildColors.primary,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  celebrationBtnText: { ...ModeTypography.buttonLabel, color: ChildColors.textOnPrimary },
  celebrationLaterBtn: { height: 44, justifyContent: 'center', alignItems: 'center' },
  celebrationLaterText: { ...TextStyle.label, color: ChildColors.textSecondary },
});
