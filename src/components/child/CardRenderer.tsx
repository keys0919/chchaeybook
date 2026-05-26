import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { PenLine } from 'lucide-react-native';
import { ChildColors, Spacing, Radius, ComponentSize } from '../../design/tokens';
import { TextStyle, ModeTypography, FontFamily } from '../../design/typography';
import type { Card } from '../../types/card.types';

interface CardRendererProps {
  card: Card;
  onComplete: () => void;
  onSkip: () => void;
  isLastCard?: boolean;
}

export function CardRenderer({ card, onComplete, onSkip, isLastCard = true }: CardRendererProps) {
  const handleSkip = () => {
    Alert.alert('건너뛸까요?', '조금만 더 생각해볼까요?', [
      { text: '계속 해보기', style: 'cancel' },
      { text: '건너뛰기', style: 'destructive', onPress: onSkip },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 카드 헤더 */}
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>Lv.{card.level}</Text>
            </View>
            <Text style={styles.cardTitle}>{card.title}</Text>
          </View>

          <Text style={styles.question}>{card.question}</Text>

          {card.guide.length > 0 && (
            <View style={styles.guideBox}>
              {card.guide.map((g, i) => (
                <Text key={i} style={styles.guideItem}>· {g}</Text>
              ))}
            </View>
          )}

          <Text style={styles.outputGoal}>목표 분량: {card.output_goal}</Text>
        </View>

        {/* 독서록 가이드 */}
        <View style={styles.writeGuide}>
          <PenLine size={20} color={ChildColors.primary} strokeWidth={2} />
          <View style={styles.writeGuideText}>
            <Text style={styles.writeGuideTitle}>독서록에 직접 써보세요</Text>
            <Text style={styles.writeGuideDesc}>위 질문을 보고 독서록에 기록해요</Text>
          </View>
        </View>

        {/* 문장 시작어 참고 */}
        {card.sentence_starters.length > 0 && (
          <View style={styles.startersSection}>
            <Text style={styles.startersLabel}>참고할 문장 시작어</Text>
            <View style={styles.chipGrid}>
              {card.sentence_starters.map((s, i) => (
                <View key={i} style={styles.chip}>
                  <Text style={styles.chipText}>{s}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        {/* 액션 버튼 */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryBtn} onPress={onComplete}>
            <Text style={styles.primaryBtnText}>{isLastCard ? '다 썼어요!' : '다음'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
            <Text style={styles.skipText}>건너뛰기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollArea: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing['2xl'], gap: Spacing.md },

  card: {
    backgroundColor: ChildColors.surface1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  levelBadge: {
    backgroundColor: ChildColors.primaryLight,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  levelBadgeText: { ...TextStyle.caption, color: ChildColors.primary, fontWeight: '700' },
  cardTitle: { ...TextStyle.label, color: ChildColors.textSecondary, fontWeight: '600', flex: 1 },
  question: { ...ModeTypography.childCardQuestion, color: ChildColors.textPrimary },
  guideBox: {
    backgroundColor: ChildColors.surface2,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    gap: 4,
    marginTop: Spacing.xs,
  },
  guideItem: { ...TextStyle.body, color: ChildColors.textSecondary, lineHeight: 22 },
  outputGoal: { ...TextStyle.caption, color: ChildColors.textTertiary, marginTop: 4 },

  writeGuide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#FFF8F5',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: ChildColors.primaryLight,
  },
  writeGuideText: { gap: 2 },
  writeGuideTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: 15,
    fontWeight: '600',
    color: ChildColors.primary,
  },
  writeGuideDesc: {
    ...TextStyle.caption,
    color: ChildColors.textSecondary,
  },

  startersSection: { gap: Spacing.sm },
  startersLabel: { ...TextStyle.caption, color: ChildColors.textTertiary },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: ChildColors.divider,
    backgroundColor: ChildColors.surface1,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  chipText: { ...TextStyle.label, color: ChildColors.textSecondary },

  actions: { gap: Spacing.xs, paddingTop: Spacing.md },
  primaryBtn: {
    height: ComponentSize.buttonHeight,
    backgroundColor: ChildColors.primary,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: { ...ModeTypography.buttonLabel, color: ChildColors.textOnPrimary },
  skipBtn: {
    height: ComponentSize.touchTargetChild,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipText: { ...TextStyle.label, color: ChildColors.textSecondary },
});
