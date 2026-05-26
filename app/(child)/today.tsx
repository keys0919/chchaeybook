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
import { BookOpen, Settings } from 'lucide-react-native';
import {
  ChildColors,
  Spacing,
  Radius,
  ComponentSize,
  Shadow,
  CopyTokens,
} from '../../src/design/tokens';
import { TextStyle, ModeTypography, FontFamily } from '../../src/design/typography';
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

  const levelProgress = Math.min((levelCount / LEVEL_UP_THRESHOLD) * 100, 100);
  const isMaxLevel = profile.current_level >= MAX_LEVEL;
  const isLevelReady = levelCount >= LEVEL_UP_THRESHOLD;

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

      {/* 고정 헤더 */}
      <View style={styles.pageHeader}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>안녕, {profile.nickname}!</Text>
            <Text style={styles.subGreeting}>오늘 읽은 책 독서록을 써볼까요?</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => router.push('/(child)/settings' as any)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Settings size={22} color={ChildColors.textTertiary} strokeWidth={1.8} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 진행도 카드 */}
        {!loading ? (
          <View style={styles.progressCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={styles.statValueRow}>
                  <Text style={styles.statValue}>
                    {weeklyCount === 0 ? '-' : String(weeklyCount)}
                  </Text>
                  {weeklyCount > 0 && <Text style={styles.statUnit}>번</Text>}
                </View>
                <Text style={styles.statLabel}>이번 주 기록</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <View style={styles.statValueRow}>
                  <Text style={styles.statUnit}>Lv.</Text>
                  <Text style={styles.statValue}>{profile.current_level}</Text>
                </View>
                <Text style={styles.statLabel}>현재 레벨</Text>
              </View>
            </View>

            <View style={styles.levelTrack}>
              <View
                style={[
                  styles.levelFill,
                  isLevelReady && styles.levelFillReady,
                  { width: `${levelProgress}%` as any },
                ]}
              />
            </View>

            <Text style={styles.levelHint}>
              {isMaxLevel
                ? '최고 레벨 달성! 계속 써봐요 💪'
                : isLevelReady
                ? '레벨업 준비 완료!'
                : `레벨업까지 ${LEVEL_UP_THRESHOLD - levelCount}번 더`}
            </Text>
          </View>
        ) : null}

        <View style={{ height: Spacing.xl }} />

        {loading ? (
          <View style={styles.loadingArea}>
            <ActivityIndicator color={ChildColors.primary} />
          </View>
        ) : drafts.length === 0 ? (
          <View style={styles.emptyArea}>
            <BookOpen size={56} color={ChildColors.textTertiary} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>{CopyTokens.EMPTY_CHILD_HOME}</Text>
            <Text style={styles.emptyDesc}>책을 읽고 독서록을 남겨요.</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleNewBook}>
              <Text style={styles.primaryBtnText}>새 책 시작하기</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.sectionLabel}>이어서 쓰기</Text>
            <View style={{ height: Spacing.sm }} />

            {drafts.map((draft) => (
              <View key={draft.draft_id} style={styles.resumeCard}>
                <View style={styles.resumeCardBody}>
                  <Text style={styles.resumeBookTitle} numberOfLines={1}>
                    {draft.book_title}
                  </Text>
                  {draft.partial_input?.type === 'text' && draft.partial_input.text ? (
                    <Text style={styles.resumeInputSummary} numberOfLines={2}>
                      {draft.partial_input.text}
                    </Text>
                  ) : null}
                  <Text style={styles.resumeExpiry}>{draftExpiryLabel(draft.expires_at)}</Text>
                </View>
                <TouchableOpacity style={styles.resumeChip} onPress={() => handleResume(draft)}>
                  <Text style={styles.resumeChipText}>이어 쓰기</Text>
                </TouchableOpacity>
              </View>
            ))}

            <View style={{ height: Spacing.xl }} />

            <TouchableOpacity style={styles.secondaryBtn} onPress={handleNewBook}>
              <Text style={styles.secondaryBtnText}>+ 새 책 시작하기</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: ChildColors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingArea: { paddingVertical: Spacing.xl, alignItems: 'center' },

  pageHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    backgroundColor: ChildColors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  headerText: { flex: 1 },
  settingsBtn: {
    padding: 4,
    marginTop: 4,
  },
  greeting: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    fontWeight: '700',
    color: ChildColors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 35,
  },
  subGreeting: {
    ...TextStyle.body,
    color: ChildColors.textSecondary,
    marginTop: 4,
  },

  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },

  progressCard: {
    backgroundColor: ChildColors.surface1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
    ...Shadow.level1,
    shadowColor: '#1A1A1A',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  statValue: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    fontWeight: '800',
    color: ChildColors.textPrimary,
    letterSpacing: -1,
    lineHeight: 32,
  },
  statUnit: {
    fontFamily: FontFamily.semibold,
    fontSize: 14,
    fontWeight: '600',
    color: ChildColors.textSecondary,
    lineHeight: 20,
  },
  statLabel: {
    ...TextStyle.caption,
    color: ChildColors.textTertiary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: ChildColors.divider,
    marginHorizontal: Spacing.md,
  },
  levelTrack: {
    height: 8,
    backgroundColor: ChildColors.surface2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  levelFill: {
    height: '100%',
    backgroundColor: ChildColors.primary,
    borderRadius: 4,
  },
  levelFillReady: { backgroundColor: ChildColors.statusSuccess },
  levelHint: {
    ...TextStyle.caption,
    color: ChildColors.textSecondary,
  },

  sectionLabel: {
    ...TextStyle.label,
    color: ChildColors.textSecondary,
    fontWeight: '600',
  },

  resumeCard: {
    backgroundColor: ChildColors.surface1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadow.level1,
    shadowColor: '#1A1A1A',
  },
  resumeCardBody: {
    flex: 1,
    gap: Spacing.xs,
  },
  resumeBookTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: 16,
    fontWeight: '600',
    color: ChildColors.textPrimary,
    lineHeight: 22,
  },
  resumeInputSummary: {
    ...TextStyle.body,
    fontSize: 14,
    color: ChildColors.textSecondary,
    lineHeight: 20,
  },
  resumeExpiry: {
    ...TextStyle.caption,
    color: ChildColors.statusWarning,
  },
  resumeChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    backgroundColor: ChildColors.primary,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  resumeChipText: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    fontWeight: '700',
    color: ChildColors.textOnPrimary,
  },

  emptyArea: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
  },
  emptyTitle: {
    ...TextStyle.title,
    color: ChildColors.textPrimary,
    textAlign: 'center',
  },
  emptyDesc: {
    ...TextStyle.body,
    color: ChildColors.textSecondary,
    textAlign: 'center',
    marginTop: -Spacing.xs,
  },

  primaryBtn: {
    height: ComponentSize.buttonHeight,
    paddingHorizontal: Spacing.xl,
    backgroundColor: ChildColors.primary,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
    alignSelf: 'stretch',
  },
  primaryBtnText: { ...ModeTypography.buttonLabel, color: ChildColors.textOnPrimary },

  secondaryBtn: {
    height: ComponentSize.buttonHeight,
    backgroundColor: ChildColors.primaryLight,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtnText: { ...ModeTypography.buttonLabel, color: ChildColors.primary },

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
