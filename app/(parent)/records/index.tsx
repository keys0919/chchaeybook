// C-2 부모 기록 리스트 — book_title 그룹핑, 미확인 기록 상단 우선
import { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SectionList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ParentColors, Spacing, Radius, Shadow, ComponentSize } from '../../../src/design/tokens';
import { TextStyle, ModeTypography } from '../../../src/design/typography';
import { useAuthStore } from '../../../src/stores/auth.store';
import {
  getParentBookshelf,
  getParentRecordsByBook,
  type ParentRecord,
  type ParentBookEntry,
} from '../../../src/services/parent-record.service';

interface Section {
  book: ParentBookEntry;
  data: ParentRecord[];
}

function levelLabel(level: number): string {
  return `Lv.${level}`;
}

function dateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function RecordsScreen() {
  const router = useRouter();
  const { childProfile } = useAuthStore();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!childProfile) return;
      setLoading(true);
      getParentBookshelf(childProfile.child_id)
        .then(async (books) => {
          const result: Section[] = [];
          for (const book of books) {
            const records = await getParentRecordsByBook(childProfile.child_id, book.book_title);
            result.push({ book, data: records });
          }
          setSections(result);
        })
        .catch(() => setSections([]))
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>기록</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={ParentColors.primary} />
        </View>
      ) : sections.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>📖</Text>
          <Text style={styles.emptyText}>
            아직 기록이 없어요.{'\n'}아이가 첫 문장을 쓰면 여기에 표시돼요.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.record_id}
          contentContainerStyle={styles.listContent}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle} numberOfLines={1}>
                {section.book.book_title}
              </Text>
              {section.book.unseen_count > 0 ? (
                <View style={styles.unseenBadge}>
                  <Text style={styles.unseenBadgeText}>미확인 {section.book.unseen_count}</Text>
                </View>
              ) : null}
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.recordCard, !item.parent_praise_id && styles.recordCardUnseen]}
              onPress={() => router.push({ pathname: '/(parent)/records/[id]', params: { id: item.record_id } })}
            >
              <View style={styles.recordCardInner}>
                <View style={styles.recordMeta}>
                  <Text style={styles.levelBadge}>{levelLabel(item.level)}</Text>
                  <Text style={styles.dateText}>{dateLabel(item.created_at)}</Text>
                  {!item.parent_praise_id && (
                    <View style={styles.newDot} />
                  )}
                </View>
                <Text style={styles.sentencePreview} numberOfLines={2}>
                  {item.sentences[0] ?? ''}
                </Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          )}
          SectionSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.xs }} />}
        />
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyText: {
    ...TextStyle.body,
    color: ParentColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  listContent: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  sectionTitle: { ...TextStyle.title, color: ParentColors.textPrimary, flex: 1 },
  unseenBadge: {
    backgroundColor: ParentColors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  unseenBadgeText: { ...TextStyle.caption, color: '#FFFFFF', fontWeight: '700' },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ParentColors.surface1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: ParentColors.divider,
    ...Shadow.level1,
    shadowColor: '#000',
  },
  recordCardUnseen: {
    borderColor: ParentColors.primary,
    borderWidth: 1.5,
    backgroundColor: '#FFF8F5',
  },
  recordCardInner: { flex: 1 },
  recordMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: 4 },
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
  newDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ParentColors.primary,
    marginLeft: 2,
  },
  sentencePreview: { ...TextStyle.body, color: ParentColors.textPrimary, lineHeight: 22 },
  arrow: { ...TextStyle.heading2, color: ParentColors.textTertiary, marginLeft: Spacing.sm },
});
