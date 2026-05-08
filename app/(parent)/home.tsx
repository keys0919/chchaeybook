// C-1 부모 홈 — S1/S2/S3 + StatCard + 이번 주 목표 카드
import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ParentColors, Spacing, Radius, Shadow, ComponentSize } from '../../src/design/tokens';
import { TextStyle, ModeTypography } from '../../src/design/typography';
import { useAuthStore } from '../../src/stores/auth.store';
import { useGoalStore } from '../../src/stores/goal.store';
import {
  getAllUnseenRecords,
  getParentBookshelf,
  getMonthlyStats,
  getWeeklyRecordCount,
  type ParentRecord,
  type ParentBookEntry,
  type MonthlyStats,
} from '../../src/services/parent-record.service';

function dateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function levelLabel(level: number): string {
  return `Lv.${level}`;
}

function monthLabel(): string {
  const now = new Date();
  return `${now.getMonth() + 1}월`;
}

export default function ParentHomeScreen() {
  const router = useRouter();
  const { childProfile } = useAuthStore();
  const { weeklyGoal, loadGoal } = useGoalStore();

  const [unseenRecords, setUnseenRecords] = useState<ParentRecord[]>([]);
  const [recentBooks, setRecentBooks] = useState<ParentBookEntry[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>({ booksRead: 0, sentencesCompleted: 0 });
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (childProfile) loadGoal(childProfile.child_id);
  }, [childProfile?.child_id]);

  useFocusEffect(
    useCallback(() => {
      if (!childProfile) return;
      setLoading(true);
      Promise.all([
        getAllUnseenRecords(childProfile.child_id),
        getParentBookshelf(childProfile.child_id),
        getMonthlyStats(childProfile.child_id),
        getWeeklyRecordCount(childProfile.child_id),
      ])
        .then(([unseen, books, stats, weekly]) => {
          setUnseenRecords(unseen);
          setRecentBooks(books.slice(0, 3));
          setMonthlyStats(stats);
          setWeeklyCount(weekly);
        })
        .catch(() => {
          setUnseenRecords([]);
          setRecentBooks([]);
        })
        .finally(() => setLoading(false));
    }, [childProfile])
  );

  if (!childProfile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator color={ParentColors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const hasRecords = recentBooks.length > 0;
  const hasUnseen = unseenRecords.length > 0;
  const weeklyProgress = Math.min(weeklyCount / weeklyGoal, 1);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>홈</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={ParentColors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.greeting}>{childProfile.nickname}의 독서 기록</Text>

          <View style={{ height: Spacing.lg }} />

          {/* S1: 기록 없음 */}
          {!hasRecords ? (
            <View style={styles.emptyArea}>
              <Text style={styles.emptyEmoji}>📖</Text>
              <Text style={styles.emptyText}>
                지금 아이 모드로 전환해서{'\n'}첫 문장을 써볼까요?
              </Text>
            </View>
          ) : (
            <>
              {/* S3: 미확인 기록 */}
              {hasUnseen ? (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>확인 안 한 기록</Text>
                  <View style={{ height: Spacing.sm }} />
                  {unseenRecords.map((record) => (
                    <TouchableOpacity
                      key={record.record_id}
                      style={styles.unseenCard}
                      onPress={() =>
                        router.push({
                          pathname: '/(parent)/records/[id]',
                          params: { id: record.record_id },
                        })
                      }
                    >
                      <View style={styles.unseenCardInner}>
                        <View style={styles.recordMeta}>
                          <Text style={styles.levelBadge}>{levelLabel(record.level)}</Text>
                          <Text style={styles.dateText}>{dateLabel(record.created_at)}</Text>
                        </View>
                        <Text style={styles.bookTitleText} numberOfLines={1}>
                          {record.book_title}
                        </Text>
                        <Text style={styles.sentencePreview} numberOfLines={1}>
                          {record.sentences[0] ?? ''}
                        </Text>
                        <Text style={styles.ctaText}>확인하고 칭찬 보내기 →</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}

              {/* 이번 달 요약 StatCard */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>{monthLabel()} 요약</Text>
                <View style={{ height: Spacing.sm }} />
                <View style={styles.statCard}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{monthlyStats.booksRead}</Text>
                    <Text style={styles.statLabel}>읽은 책</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{monthlyStats.sentencesCompleted}</Text>
                    <Text style={styles.statLabel}>완성 문장</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>Lv.{childProfile.current_level}</Text>
                    <Text style={styles.statLabel}>현재 레벨</Text>
                  </View>
                </View>
              </View>

              {/* 이번 주 목표 카드 */}
              <View style={styles.section}>
                <View style={styles.goalCardHeader}>
                  <Text style={styles.sectionLabel}>이번 주 목표</Text>
                  <Text style={styles.goalCount}>{weeklyCount}/{weeklyGoal}회</Text>
                </View>
                <View style={{ height: Spacing.sm }} />
                <View style={styles.goalCard}>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${weeklyProgress * 100}%` as any }]} />
                  </View>
                  <Text style={styles.goalSubText}>
                    {weeklyCount >= weeklyGoal
                      ? '🎉 이번 주 목표를 달성했어요!'
                      : `목표까지 ${weeklyGoal - weeklyCount}회 남았어요`}
                  </Text>
                </View>
              </View>

              {/* 최근 책 목록 */}
              {recentBooks.length > 0 ? (
                <View style={styles.section}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionLabel}>최근 읽은 책</Text>
                    <TouchableOpacity onPress={() => router.push('/(parent)/records/album' as any)}>
                      <Text style={styles.albumLink}>이달의 앨범 →</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ height: Spacing.sm }} />
                  {recentBooks.map((book) => (
                    <TouchableOpacity
                      key={book.book_title}
                      style={styles.bookCard}
                      onPress={() => router.push('/(parent)/records')}
                    >
                      <View style={styles.bookCardInner}>
                        <Text style={styles.bookCardTitle} numberOfLines={1}>
                          {book.book_title}
                        </Text>
                        <Text style={styles.bookCardMeta}>기록 {book.total_records}개</Text>
                      </View>
                      <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: ParentColors.background },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: ParentColors.divider,
  },
  headerTitle: { ...TextStyle.heading2, color: ParentColors.textPrimary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  greeting: { ...TextStyle.title, color: ParentColors.textPrimary },
  emptyArea: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing['2xl'] },
  emptyEmoji: { fontSize: 48 },
  emptyText: {
    ...TextStyle.body,
    color: ParentColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: { marginBottom: Spacing.lg },
  sectionLabel: { ...TextStyle.label, color: ParentColors.textSecondary },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  albumLink: { ...TextStyle.caption, color: ParentColors.primary },
  unseenCard: {
    backgroundColor: '#FFF8F5',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: ParentColors.primary,
    marginBottom: Spacing.sm,
    ...Shadow.level1,
    shadowColor: '#000',
  },
  unseenCardInner: { gap: 4 },
  recordMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  levelBadge: {
    ...TextStyle.caption,
    color: ParentColors.primary,
    fontWeight: '700',
    backgroundColor: ParentColors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  dateText: { ...TextStyle.caption, color: ParentColors.textTertiary },
  bookTitleText: { ...TextStyle.label, color: ParentColors.textPrimary, fontWeight: '700' },
  sentencePreview: { ...TextStyle.body, color: ParentColors.textSecondary },
  ctaText: { ...TextStyle.label, color: ParentColors.primary, marginTop: Spacing.xs },
  // StatCard
  statCard: {
    flexDirection: 'row',
    backgroundColor: ParentColors.surface1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: ParentColors.divider,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { ...TextStyle.heading2, color: ParentColors.textPrimary, fontWeight: '700' },
  statLabel: { ...TextStyle.caption, color: ParentColors.textTertiary },
  statDivider: { width: 1, backgroundColor: ParentColors.divider, marginVertical: 4 },
  // Goal card
  goalCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  goalCount: { ...TextStyle.label, color: ParentColors.primary, fontWeight: '700' },
  goalCard: {
    backgroundColor: ParentColors.surface1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: ParentColors.divider,
    gap: Spacing.sm,
  },
  progressTrack: {
    height: 8,
    backgroundColor: ParentColors.surface2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: ParentColors.primary,
    borderRadius: 4,
  },
  goalSubText: { ...TextStyle.caption, color: ParentColors.textSecondary },
  // Book card
  bookCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ParentColors.surface1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: ParentColors.divider,
  },
  bookCardInner: { flex: 1 },
  bookCardTitle: { ...TextStyle.body, color: ParentColors.textPrimary, fontWeight: '600' },
  bookCardMeta: { ...TextStyle.caption, color: ParentColors.textTertiary, marginTop: 2 },
  arrow: { ...TextStyle.heading2, color: ParentColors.textTertiary, marginLeft: Spacing.sm },
});
