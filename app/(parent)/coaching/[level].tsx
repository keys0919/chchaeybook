// C-9 레벨별 질문 가이드 상세
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ParentColors, Spacing, Radius } from '../../../src/design/tokens';
import { TextStyle } from '../../../src/design/typography';
import { COACHING_LEVELS } from '../../../src/data/coaching-content';

export default function CoachingLevelScreen() {
  const router = useRouter();
  const { level } = useLocalSearchParams<{ level: string }>();
  const levelNum = parseInt(level ?? '1', 10);
  const content = COACHING_LEVELS.find((c) => c.level === levelNum);

  if (!content) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.errorText}>존재하지 않는 레벨이에요.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Level {content.level} 코칭</Text>
        <View style={{ width: 56 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* 레벨 요약 */}
        <View style={styles.levelSummary}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>Lv.{content.level}</Text>
          </View>
          <Text style={styles.levelLabel}>{content.label}</Text>
        </View>
        <Text style={styles.levelDesc}>{content.description}</Text>

        <View style={{ height: Spacing.xl }} />

        {/* 질문 가이드 */}
        <Text style={styles.sectionTitle}>질문 가이드</Text>
        <Text style={styles.sectionSubDesc}>
          아이가 기록을 쓰기 전후에 자연스럽게 건넬 수 있는 질문들이에요.
        </Text>
        <View style={{ height: Spacing.sm }} />
        {content.guideQuestions.map((q, i) => (
          <View key={i} style={styles.questionCard}>
            <View style={styles.questionNum}>
              <Text style={styles.questionNumText}>{i + 1}</Text>
            </View>
            <Text style={styles.questionText}>{q}</Text>
          </View>
        ))}

        <View style={{ height: Spacing.xl }} />

        {/* 첨삭 기준 */}
        <Text style={styles.sectionTitle}>이 레벨 첨삭 기준</Text>
        <Text style={styles.sectionSubDesc}>
          아이의 글을 읽을 때 집중해야 할 포인트예요.
        </Text>
        <View style={{ height: Spacing.sm }} />
        {content.feedbackCriteria.map((c, i) => (
          <View key={i} style={styles.criteriaRow}>
            <View style={styles.criteriaDot} />
            <Text style={styles.criteriaText}>{c}</Text>
          </View>
        ))}

        <View style={{ height: Spacing.xl }} />

        {/* 다른 레벨 보기 */}
        <Text style={styles.otherLevelsTitle}>다른 레벨 보기</Text>
        <View style={{ height: Spacing.sm }} />
        <View style={styles.otherLevelsRow}>
          {COACHING_LEVELS.filter((l) => l.level !== content.level).map((l) => (
            <TouchableOpacity
              key={l.level}
              style={styles.otherLevelBtn}
              onPress={() =>
                router.replace({
                  pathname: '/(parent)/coaching/[level]',
                  params: { level: String(l.level) },
                })
              }
            >
              <Text style={styles.otherLevelBtnText}>Lv.{l.level}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { ...TextStyle.body, color: ParentColors.textSecondary },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  levelSummary: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  levelBadge: {
    backgroundColor: ParentColors.primaryLight,
    borderRadius: Radius.xs,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  levelBadgeText: { ...TextStyle.label, color: ParentColors.primary, fontWeight: '700' },
  levelLabel: { ...TextStyle.heading2, color: ParentColors.textPrimary },
  levelDesc: { ...TextStyle.body, color: ParentColors.textSecondary, lineHeight: 22 },
  sectionTitle: { ...TextStyle.heading2, color: ParentColors.textPrimary, marginBottom: 4 },
  sectionSubDesc: { ...TextStyle.body, color: ParentColors.textSecondary, lineHeight: 22 },
  questionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: ParentColors.surface1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: ParentColors.divider,
  },
  questionNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: ParentColors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  questionNumText: { ...TextStyle.caption, color: ParentColors.primary, fontWeight: '700' },
  questionText: { ...TextStyle.body, color: ParentColors.textPrimary, flex: 1, lineHeight: 22 },
  criteriaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  criteriaDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ParentColors.primary,
    marginTop: 8,
    flexShrink: 0,
  },
  criteriaText: { ...TextStyle.body, color: ParentColors.textPrimary, flex: 1, lineHeight: 22 },
  otherLevelsTitle: { ...TextStyle.label, color: ParentColors.textSecondary },
  otherLevelsRow: { flexDirection: 'row', gap: Spacing.sm },
  otherLevelBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: ParentColors.divider,
    backgroundColor: ParentColors.surface1,
  },
  otherLevelBtnText: { ...TextStyle.label, color: ParentColors.textSecondary },
});
