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
import { Trash2 } from 'lucide-react-native';
import { ChildColors, Spacing, Radius, Shadow, CopyTokens, ComponentSize } from '../../../src/design/tokens';
import { TextStyle, ModeTypography, FontFamily } from '../../../src/design/typography';
import { useProfileStore } from '../../../src/stores/profile.store';
import { getBookshelf, deleteBook, type BookshelfEntry } from '../../../src/services/record.service';

function formatDate(isoStr: string): string {
  const d = new Date(isoStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export default function BookshelfScreen() {
  const router = useRouter();
  const { profile } = useProfileStore();
  const [books, setBooks] = useState<BookshelfEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  const loadBooks = useCallback(() => {
    if (!profile) return;
    setLoading(true);
    getBookshelf(profile.child_id)
      .then(setBooks)
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, [profile]);

  useFocusEffect(useCallback(() => {
    loadBooks();
    setEditMode(false);
  }, [loadBooks]));

  const handleBook = (bookTitle: string) => {
    if (editMode) return;
    router.push({ pathname: '/bookshelf/[bookTitle]', params: { bookTitle } });
  };

  const handleDelete = (bookTitle: string) => {
    if (!profile) return;
    deleteBook(profile.child_id, bookTitle);
    setBooks((prev) => prev.filter((b) => b.book_title !== bookTitle));
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
      <View style={styles.pageHeader}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>책장</Text>
          {books.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{books.length}권</Text>
            </View>
          )}
          {books.length > 0 && (
            <TouchableOpacity style={styles.editBtn} onPress={() => setEditMode((v) => !v)}>
              <Text style={[styles.editBtnText, editMode && styles.editBtnTextActive]}>
                {editMode ? '완료' : '편집'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {books.length > 0 && !editMode && (
          <Text style={styles.subtitle}>읽은 책을 눌러 기록을 확인해요</Text>
        )}
        {editMode && (
          <Text style={styles.subtitle}>삭제할 책의 휴지통 버튼을 눌러요</Text>
        )}
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
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleBook(item.book_title)}
              activeOpacity={editMode ? 1 : 0.7}
            >
              <View style={styles.cardAccent} />
              <View style={styles.cardBody}>
                <Text style={styles.bookTitle} numberOfLines={2}>{item.book_title}</Text>
                <Text style={styles.meta}>
                  {item.record_count}번 기록 · 마지막 {formatDate(item.last_read)}
                </Text>
              </View>
              {editMode ? (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item.book_title)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Trash2 size={20} color="#FF4545" strokeWidth={2} />
                </TouchableOpacity>
              ) : (
                <View style={styles.stampBadge}>
                  <Text style={styles.stampCount}>{item.total_stamps}</Text>
                  <Text style={styles.stampLabel}>도장</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
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
    flex: 1,
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

  list: { padding: Spacing.md, gap: Spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ChildColors.surface1,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    shadowColor: '#1A1A1A',
    ...Shadow.level1,
  },
  cardAccent: {
    width: 4,
    alignSelf: 'stretch',
    backgroundColor: ChildColors.primary,
    opacity: 0.7,
  },
  cardBody: {
    flex: 1,
    padding: Spacing.md,
    gap: 4,
  },
  bookTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: 16,
    fontWeight: '600',
    color: ChildColors.textPrimary,
    lineHeight: 22,
  },
  meta: { ...TextStyle.caption, color: ChildColors.textSecondary },
  stampBadge: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    backgroundColor: ChildColors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  stampCount: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    fontWeight: '700',
    color: ChildColors.primary,
  },
  stampLabel: {
    fontSize: 10,
    fontFamily: FontFamily.medium,
    color: ChildColors.primary,
    fontWeight: '500',
  },
  editBtn: {
    marginLeft: 'auto' as any,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  editBtnText: {
    fontFamily: FontFamily.semibold,
    fontSize: 14,
    fontWeight: '600',
    color: ChildColors.textSecondary,
  },
  editBtnTextActive: {
    color: ChildColors.primary,
  },
  deleteBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.xs,
  },
});
