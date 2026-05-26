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
import { TextStyle, ModeTypography, FontFamily } from '../../src/design/typography';
import { useProfileStore } from '../../src/stores/profile.store';
import { getAllStamps, type StampEntry } from '../../src/services/record.service';

function formatDate(isoStr: string): string {
  const d = new Date(isoStr);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function StampsScreen() {
  const router = useRouter();
  const { profile } = useProfileStore();
  const [stamps, setStamps] = useState<StampEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!profile) return;
      setLoading(true);
      getAllStamps(profile.child_id)
        .then(setStamps)
        .catch(() => setStamps([]))
        .finally(() => setLoading(false));
    }, [profile])
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
      <View style={styles.pageHeader}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>도장</Text>
          {stamps.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{stamps.length}개</Text>
            </View>
          )}
        </View>
        {stamps.length > 0 && (
          <Text style={styles.subtitle}>지금까지 모은 독서 도장이에요</Text>
        )}
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
          showsVerticalScrollIndicator={false}
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
      <Text style={styles.stampBook} numberOfLines={2}>{stamp.book_title}</Text>
      <Text style={styles.stampDate}>{formatDate(stamp.read_date)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: ChildColors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  pageHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: ChildColors.divider,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    fontWeight: '700',
    color: ChildColors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 35,
  },
  countBadge: {
    backgroundColor: ChildColors.primaryLight,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 4,
  },
  countBadgeText: {
    ...TextStyle.caption,
    color: ChildColors.primary,
    fontWeight: '700',
  },
  subtitle: {
    ...TextStyle.body,
    color: ChildColors.textSecondary,
  },

  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing['2xl'],
    gap: Spacing.md,
  },
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
  row: { justifyContent: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.md },
  stampItem: {
    flex: 1,
    maxWidth: '33.33%',
    alignItems: 'center',
    padding: Spacing.xs,
    gap: 6,
  },
  stampCircle: {
    width: ComponentSize.stampBadgeLarge,
    height: ComponentSize.stampBadgeLarge,
    borderRadius: Radius.full,
    backgroundColor: ChildColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF7340',
    ...Shadow.level1,
  },
  stampEmoji: { fontSize: 26 },
  stampBook: {
    ...TextStyle.caption,
    color: ChildColors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  stampDate: {
    fontSize: 10,
    fontFamily: FontFamily.regular,
    color: ChildColors.textTertiary,
  },
});
