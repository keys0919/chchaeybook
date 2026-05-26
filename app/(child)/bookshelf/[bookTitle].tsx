// D-6 책별 기록 카드
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
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { ChildColors, Spacing, Radius, Shadow, ComponentSize } from '../../../src/design/tokens';
import { TextStyle } from '../../../src/design/typography';
import { useProfileStore } from '../../../src/stores/profile.store';
import { getRecordsByBook } from '../../../src/services/record.service';
import type { ReadingRecord } from '../../../src/types/db.types';

function formatDate(isoStr: string): string {
  const d = new Date(isoStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export default function BookDetailScreen() {
  const router = useRouter();
  const { bookTitle } = useLocalSearchParams<{ bookTitle: string }>();
  const { profile } = useProfileStore();
  const [records, setRecords] = useState<ReadingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!profile || !bookTitle) return;
      setLoading(true);
      getRecordsByBook(profile.child_id, bookTitle)
        .then(setRecords)
        .catch(() => setRecords([]))
        .finally(() => setLoading(false));
    }, [profile, bookTitle])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{bookTitle}</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={ChildColors.primary} />
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.record_id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <RecordCard record={item} />}
        />
      )}
    </SafeAreaView>
  );
}

function RecordCard({ record }: { record: ReadingRecord }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.dateText}>{formatDate(record.created_at)}</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>Level {record.level}</Text>
        </View>
      </View>

      {record.sentences.length > 0 ? (
        <View style={styles.sentencesSection}>
          {record.sentences.map((s, i) => (
            <View key={i} style={styles.sentenceRow}>
              <View style={styles.quoteBar} />
              <Text style={styles.sentenceText}>{s}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {record.badges.length > 0 ? (
        <View style={styles.stampsRow}>
          {record.badges.map((badge, i) => (
            <View key={i} style={styles.stampCircle}>
              <Text style={styles.stampEmoji}>{badge}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: ChildColors.background },
  header: {
    height: ComponentSize.topBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: ChildColors.divider,
    gap: Spacing.sm,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backArrow: { fontSize: 24, color: ChildColors.textPrimary },
  headerTitle: { ...TextStyle.heading2, color: ChildColors.textPrimary, flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: Spacing.md, gap: Spacing.md },
  card: {
    backgroundColor: ChildColors.surface1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    shadowColor: '#1A1A1A',
    ...Shadow.level1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  dateText: { ...TextStyle.caption, color: ChildColors.textSecondary },
  levelBadge: {
    backgroundColor: '#C8D8FF',
    borderRadius: Radius.xs,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  levelBadgeText: { ...TextStyle.caption, color: '#3D6FFF' },
  sentencesSection: { gap: Spacing.xs },
  sentenceRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  quoteBar: { width: 3, minHeight: 18, backgroundColor: ChildColors.primary, borderRadius: 2, marginTop: 4 },
  sentenceText: { ...TextStyle.body, color: ChildColors.textPrimary, flex: 1, lineHeight: 26 },
  stampsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  stampCircle: {
    width: ComponentSize.stampBadgeMedium,
    height: ComponentSize.stampBadgeMedium,
    borderRadius: Radius.full,
    backgroundColor: ChildColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stampEmoji: { fontSize: 22 },
});
