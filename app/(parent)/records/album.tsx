// C-5 월별 앨범 미리보기 — S1(3개 미만) / S2(3개↑, 무료) / S3(유료)
import { useCallback, useState } from 'react';
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
import { ParentColors, Spacing, Radius, Shadow } from '../../../src/design/tokens';
import { TextStyle } from '../../../src/design/typography';
import { useAuthStore } from '../../../src/stores/auth.store';
import { useSubscriptionStore } from '../../../src/stores/subscription.store';
import {
  getMonthlyRecordsForAlbum,
  type ParentRecord,
} from '../../../src/services/parent-record.service';

function monthLabel(): string {
  const now = new Date();
  return `${now.getFullYear()}년 ${now.getMonth() + 1}월`;
}

function dateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function AlbumScreen() {
  const router = useRouter();
  const { childProfile } = useAuthStore();
  const { isPaid } = useSubscriptionStore();
  const isLocked = !isPaid;
  const [records, setRecords] = useState<ParentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!childProfile) return;
      setLoading(true);
      getMonthlyRecordsForAlbum(childProfile.child_id)
        .then(setRecords)
        .catch(() => setRecords([]))
        .finally(() => setLoading(false));
    }, [childProfile])
  );

  if (!childProfile) return null;

  const hasEnough = records.length >= 3;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{monthLabel()} 앨범</Text>
        <View style={{ width: 56 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={ParentColors.primary} />
        </View>
      ) : !hasEnough ? (
        // S1: 기록 3개 미만
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>📷</Text>
          <Text style={styles.emptyTitle}>앨범이 채워지는 중이에요</Text>
          <Text style={styles.emptyBody}>
            기록이 3개 이상 쌓이면{'\n'}이달의 인화를 볼 수 있어요
          </Text>
          <Text style={styles.progressText}>현재 {records.length}/3</Text>
        </View>
      ) : (
        // S2: 3개↑ (무료 — 문장은 또렷, 사진 자리 확보)
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.albumDesc}>{monthLabel()}에 {records.length}개의 기록이 있어요</Text>
          <View style={{ height: Spacing.md }} />

          <View style={styles.grid}>
            {records.map((record) => (
              <TouchableOpacity
                key={record.record_id}
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname: '/(parent)/records/[id]',
                    params: { id: record.record_id },
                  })
                }
              >
                {/* 사진 자리 — isLocked 시 흐림 처리 (Phase 9에서 실구현) */}
                <View style={[styles.photoPlaceholder, isLocked && styles.photoBlurred]}>
                  <Text style={styles.photoIcon}>🖼</Text>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardBook} numberOfLines={1}>{record.book_title}</Text>
                  <Text style={styles.cardSentence} numberOfLines={2}>
                    {record.sentences[0] ?? '(사진·녹음 기록)'}
                  </Text>
                  <Text style={styles.cardDate}>{dateLabel(record.created_at)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {isLocked ? (
            <TouchableOpacity
              style={styles.lockCta}
              onPress={() => router.push('/(parent)/paywall' as any)}
            >
              <Text style={styles.lockIcon}>🔒</Text>
              <Text style={styles.lockText}>프리미엄으로 앨범 기능 열기</Text>
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: ParentColors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: ParentColors.divider,
  },
  backBtn: { width: 56, paddingVertical: 4 },
  backText: { ...TextStyle.body, color: ParentColors.primary },
  headerTitle: { ...TextStyle.heading2, color: ParentColors.textPrimary },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing['2xl'],
  },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.sm },
  emptyTitle: { ...TextStyle.heading2, color: ParentColors.textPrimary, textAlign: 'center' },
  emptyBody: {
    ...TextStyle.body,
    color: ParentColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: Spacing.xs,
  },
  progressText: {
    ...TextStyle.label,
    color: ParentColors.primary,
    marginTop: Spacing.md,
    fontWeight: '700',
  },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  albumDesc: { ...TextStyle.body, color: ParentColors.textSecondary },
  grid: { gap: Spacing.sm },
  card: {
    backgroundColor: ParentColors.surface1,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: ParentColors.divider,
    overflow: 'hidden',
    ...Shadow.level1,
    shadowColor: '#000',
  },
  photoPlaceholder: {
    height: 120,
    backgroundColor: ParentColors.surface2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoBlurred: { opacity: 0.15 },
  photoIcon: { fontSize: 36 },
  cardBody: { padding: Spacing.md, gap: 4 },
  cardBook: { ...TextStyle.caption, color: ParentColors.textTertiary },
  cardSentence: { ...TextStyle.body, color: ParentColors.textPrimary, lineHeight: 22 },
  cardDate: { ...TextStyle.caption, color: ParentColors.textTertiary, marginTop: 2 },
  lockCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: ParentColors.divider,
  },
  lockIcon: { fontSize: 16 },
  lockText: { ...TextStyle.label, color: ParentColors.textSecondary },
});
