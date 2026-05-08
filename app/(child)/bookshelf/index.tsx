// D-5 책장 — book_title 그룹핑 뷰
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
import { ChildColors, Spacing, Radius, Shadow, CopyTokens, ComponentSize } from '../../../src/design/tokens';
import { TextStyle, ModeTypography } from '../../../src/design/typography';
import { useAuthStore } from '../../../src/stores/auth.store';
import { getBookshelf, type BookshelfEntry } from '../../../src/services/record.service';

function formatDate(isoStr: string): string {
  const d = new Date(isoStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export default function BookshelfScreen() {
  const router = useRouter();
  const { childProfile } = useAuthStore();
  const [books, setBooks] = useState<BookshelfEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!childProfile) return;
      setLoading(true);
      getBookshelf(childProfile.child_id)
        .then(setBooks)
        .catch(() => setBooks([]))
        .finally(() => setLoading(false));
    }, [childProfile])
  );

  const handleBook = (bookTitle: string) => {
    router.push({ pathname: '/bookshelf/[bookTitle]', params: { bookTitle } });
  };

  const handleWrite = () => router.push('/write/book-input');

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
        <Text style={styles.title}>책장</Text>
      </View>

      {books.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyEmoji}>📚</Text>
          <Text style={styles.emptyText}>{CopyTokens.EMPTY_BOOKSHELF}</Text>
          <TouchableOpacity style={styles.ctaBtn} onPress={handleWrite}>
            <Text style={styles.ctaBtnText}>쓰기 시작하기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.book_title}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => handleBook(item.book_title)}>
              <View style={styles.cardBody}>
                <Text style={styles.bookTitle} numberOfLines={2}>{item.book_title}</Text>
                <Text style={styles.meta}>
                  {item.record_count}번 기록 · 마지막 {formatDate(item.last_read)}
                </Text>
              </View>
              <View style={styles.stampBadge}>
                <Text style={styles.stampCount}>{item.total_stamps}</Text>
                <Text style={styles.stampLabel}>도장</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: ChildColors.background },
  header: {
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
    borderBottomWidth: 1,
    borderBottomColor: ChildColors.divider,
  },
  title: { ...TextStyle.heading2, color: ChildColors.textPrimary },
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
  list: { padding: Spacing.md, gap: Spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ChildColors.surface1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    shadowColor: '#000',
    ...Shadow.level1,
  },
  cardBody: { flex: 1 },
  bookTitle: { ...TextStyle.body, color: ChildColors.textPrimary, fontWeight: '600' },
  meta: { ...TextStyle.caption, color: ChildColors.textSecondary, marginTop: 4 },
  stampBadge: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    backgroundColor: ChildColors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.md,
  },
  stampCount: { fontSize: 16, fontWeight: '700', color: ChildColors.primary },
  stampLabel: { fontSize: 10, color: ChildColors.primary, fontWeight: '500' },
});
