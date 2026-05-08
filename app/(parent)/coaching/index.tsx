// C-8 코칭 탭 — 레벨 가이드 / 실패 대응 / 첨삭 기준
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ParentColors, Spacing, Radius, Shadow } from '../../../src/design/tokens';
import { TextStyle, ModeTypography } from '../../../src/design/typography';
import { COACHING_LEVELS, FAILURE_CARDS, FEEDBACK_COMMON } from '../../../src/data/coaching-content';

type TabKey = 'guide' | 'failure' | 'feedback';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'guide', label: '레벨 가이드' },
  { key: 'failure', label: '실패 대응' },
  { key: 'feedback', label: '첨삭 기준' },
];

export default function CoachingIndexScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('guide');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>코칭</Text>
      </View>

      {/* 탭 바 */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.key && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* 레벨 가이드 탭 */}
        {activeTab === 'guide' ? (
          <View style={styles.section}>
            <Text style={styles.sectionDesc}>
              아이의 현재 레벨에 맞는 질문 가이드와 코칭 팁을 확인하세요.
            </Text>
            <View style={{ height: Spacing.md }} />
            {COACHING_LEVELS.map((level) => (
              <TouchableOpacity
                key={level.level}
                style={styles.levelCard}
                onPress={() =>
                  router.push({
                    pathname: '/(parent)/coaching/[level]',
                    params: { level: String(level.level) },
                  })
                }
              >
                <View style={styles.levelCardLeft}>
                  <View style={styles.levelBadge}>
                    <Text style={styles.levelBadgeText}>Lv.{level.level}</Text>
                  </View>
                  <View style={styles.levelCardBody}>
                    <Text style={styles.levelCardTitle}>{level.label}</Text>
                    <Text style={styles.levelCardDesc} numberOfLines={1}>
                      {level.description}
                    </Text>
                  </View>
                </View>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {/* 실패 대응 탭 */}
        {activeTab === 'failure' ? (
          <View style={styles.section}>
            <Text style={styles.sectionDesc}>
              아이가 쓰기를 거부하거나 막힐 때 사용할 수 있는 대화 전략이에요.
            </Text>
            <View style={{ height: Spacing.md }} />
            {FAILURE_CARDS.map((card, i) => (
              <View key={i} style={styles.failureCard}>
                <View style={styles.failureSituation}>
                  <Text style={styles.failureSituationLabel}>상황</Text>
                  <Text style={styles.failureSituationText}>{card.situation}</Text>
                </View>
                <View style={styles.failureDivider} />
                <View style={styles.failureResponse}>
                  <Text style={styles.failureResponseLabel}>이렇게 말해보세요</Text>
                  <Text style={styles.failureResponseText}>{card.response}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {/* 첨삭 기준 탭 */}
        {activeTab === 'feedback' ? (
          <View style={styles.section}>
            <Text style={styles.sectionDesc}>
              아이의 글을 읽을 때 기억해야 할 원칙들이에요.
            </Text>
            <View style={{ height: Spacing.md }} />

            <Text style={styles.subTitle}>공통 원칙</Text>
            <View style={{ height: Spacing.sm }} />
            {FEEDBACK_COMMON.map((item, i) => (
              <View key={i} style={styles.feedbackRow}>
                <View style={styles.feedbackDot} />
                <Text style={styles.feedbackText}>{item}</Text>
              </View>
            ))}

            <View style={{ height: Spacing.lg }} />
            <Text style={styles.subTitle}>레벨별 기준</Text>
            <View style={{ height: Spacing.sm }} />
            {COACHING_LEVELS.map((level) => (
              <View key={level.level} style={styles.feedbackLevelBlock}>
                <View style={styles.feedbackLevelHeader}>
                  <View style={styles.levelBadge}>
                    <Text style={styles.levelBadgeText}>Lv.{level.level}</Text>
                  </View>
                  <Text style={styles.feedbackLevelLabel}>{level.label}</Text>
                </View>
                {level.feedbackCriteria.map((c, i) => (
                  <View key={i} style={styles.feedbackRow}>
                    <View style={styles.feedbackDot} />
                    <Text style={styles.feedbackText}>{c}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
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
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: ParentColors.divider,
    backgroundColor: ParentColors.background,
  },
  tabItem: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: { borderBottomColor: ParentColors.primary },
  tabLabel: { ...TextStyle.label, color: ParentColors.textTertiary },
  tabLabelActive: { color: ParentColors.primary, fontWeight: '700' },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  section: {},
  sectionDesc: {
    ...TextStyle.body,
    color: ParentColors.textSecondary,
    lineHeight: 22,
  },
  subTitle: { ...TextStyle.label, color: ParentColors.textPrimary, fontWeight: '700' },
  // Level cards
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: ParentColors.surface1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: ParentColors.divider,
  },
  levelCardLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  levelBadge: {
    backgroundColor: ParentColors.primaryLight,
    borderRadius: Radius.xs,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 44,
    alignItems: 'center',
  },
  levelBadgeText: { ...TextStyle.caption, color: ParentColors.primary, fontWeight: '700' },
  levelCardBody: { flex: 1 },
  levelCardTitle: { ...TextStyle.label, color: ParentColors.textPrimary, fontWeight: '600' },
  levelCardDesc: { ...TextStyle.caption, color: ParentColors.textTertiary, marginTop: 2 },
  arrow: { ...TextStyle.heading2, color: ParentColors.textTertiary, marginLeft: Spacing.sm },
  // Failure cards
  failureCard: {
    backgroundColor: ParentColors.surface1,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: ParentColors.divider,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  failureSituation: {
    backgroundColor: '#FFF8F5',
    padding: Spacing.md,
  },
  failureSituationLabel: { ...TextStyle.caption, color: ParentColors.primary, marginBottom: 4 },
  failureSituationText: { ...TextStyle.body, color: ParentColors.textPrimary, fontWeight: '600' },
  failureDivider: { height: 1, backgroundColor: ParentColors.divider },
  failureResponse: { padding: Spacing.md },
  failureResponseLabel: {
    ...TextStyle.caption,
    color: ParentColors.textTertiary,
    marginBottom: 4,
  },
  failureResponseText: { ...TextStyle.body, color: ParentColors.textPrimary, lineHeight: 22 },
  // Feedback
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  feedbackDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ParentColors.primary,
    marginTop: 8,
  },
  feedbackText: { ...TextStyle.body, color: ParentColors.textPrimary, flex: 1, lineHeight: 22 },
  feedbackLevelBlock: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
    backgroundColor: ParentColors.surface1,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: ParentColors.divider,
  },
  feedbackLevelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  feedbackLevelLabel: { ...TextStyle.label, color: ParentColors.textPrimary, fontWeight: '600' },
});
