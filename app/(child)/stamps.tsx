// D-7 도장·배지 화면 — S1(칭찬 없음) / S2(칭찬 미확인) / S3(칭찬 확인 완료)
import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ChildColors, Spacing, Radius, Shadow, CopyTokens, ComponentSize } from '../../src/design/tokens';
import { TextStyle, ModeTypography } from '../../src/design/typography';
import { useAuthStore } from '../../src/stores/auth.store';
import { usePraiseStore } from '../../src/stores/praise.store';
import { getAllStamps, type StampEntry } from '../../src/services/record.service';
import { markAllPraiseSeen } from '../../src/services/praise.service';

function formatDate(isoStr: string): string {
  const d = new Date(isoStr);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function StampsScreen() {
  const router = useRouter();
  const { childProfile } = useAuthStore();
  const { unseenCount, clearUnseen } = usePraiseStore();
  const [stamps, setStamps] = useState<StampEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!childProfile) return;
      setLoading(true);
      getAllStamps(childProfile.child_id)
        .then(setStamps)
        .catch(() => setStamps([]))
        .finally(() => setLoading(false));

      // D-7 진입 시 칭찬 확인 처리
      if (unseenCount > 0) {
        markAllPraiseSeen(childProfile.child_id).catch(() => {});
        clearUnseen();
      }
    }, [childProfile, unseenCount, clearUnseen])
  );

  if (loading) {
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
      <View style={styles.header}>
        <Text style={styles.title}>도장</Text>
        {stamps.length > 0 ? (
          <View style={styles.totalBadge}>
            <Text style={styles.totalBadgeText}>{stamps.length}개</Text>
          </View>
        ) : null}
      </View>

      {stamps.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyEmoji}>🏅</Text>
          <Text style={styles.emptyText}>{CopyTokens.EMPTY_STAMP}</Text>
          <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push('/write/book-input')}>
            <Text style={styles.ctaBtnText}>쓰기 시작하기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={stamps}
          keyExtractor={(_, i) => String(i)}
          numColumns={3}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => <StampItem stamp={item} />}
        />
      )}
    </SafeAreaView>
  );
}

function StampItem({ stamp }: { stamp: StampEntry }) {
  return (
    <View style={styles.stampItem}>
      <View style={styles.stampCircle}>
        <Text style={styles.stampEmoji}>{stamp.badge}</Text>
      </View>
      <Text style={styles.stampBook} numberOfLines={1}>{stamp.book_title}</Text>
      <Text style={styles.stampDate}>{formatDate(stamp.read_date)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: ChildColors.background },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
    borderBottomWidth: 1,
    borderBottomColor: ChildColors.divider,
    gap: Spacing.sm,
  },
  title: { ...TextStyle.heading2, color: ChildColors.textPrimary },
  totalBadge: {
    backgroundColor: ChildColors.primaryLight,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  totalBadgeText: { ...TextStyle.caption, color: ChildColors.primary, fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing['2xl'], gap: Spacing.md },
  emptyEmoji: { fontSize: 48 },
  emptyText: { ...TextStyle.body, color: ChildColors.textSecondary, textAlign: 'center' },
  ctaBtn: {
    height: ComponentSize.buttonHeight,
    paddingHorizontal: Spacing.xl,
    backgroundColor: ChildColors.primary,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  ctaBtnText: { ...ModeTypography.buttonLabel, color: ChildColors.textOnPrimary },
  grid: { padding: Spacing.md },
  row: { justifyContent: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.sm },
  stampItem: { flex: 1, maxWidth: '33.33%', alignItems: 'center', padding: Spacing.xs },
  stampCircle: {
    width: ComponentSize.stampBadgeMedium,
    height: ComponentSize.stampBadgeMedium,
    borderRadius: Radius.full,
    backgroundColor: ChildColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    ...Shadow.level1,
  },
  stampEmoji: { fontSize: 22 },
  stampBook: { ...TextStyle.caption, color: ChildColors.textSecondary, marginTop: 6, textAlign: 'center' },
  stampDate: { fontSize: 10, color: ChildColors.textTertiary, marginTop: 2 },
});
