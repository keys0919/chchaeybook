// A-5 권장 레벨 제안 + 레벨 변경 Bottom Sheet
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ParentColors,
  Spacing,
  Radius,
  ComponentSize,
  Shadow,
} from '../../src/design/tokens';
import { TextStyle, ModeTypography } from '../../src/design/typography';
import { useOnboardingStore } from '../../src/stores/onboarding.store';

const LEVEL_INFO: Record<number, { label: string; question: string; starter: string }> = {
  1: {
    label: 'Level 1',
    question: '이 책에서 가장 기억에 남는 장면은\n___ 장면이에요.',
    starter: '힌트를 선택해서 빈칸을 채워요',
  },
  2: {
    label: 'Level 2',
    question: '이 책을 읽고 어떤 생각이 들었나요?',
    starter: '나는 ___ 생각이 들었어요.',
  },
  3: {
    label: 'Level 3',
    question: '주인공에게 하고 싶은 말이 있나요?',
    starter: '나는 ___ 라고 말해주고 싶어요.',
  },
  4: {
    label: 'Level 4',
    question: '독서록 키트',
    starter: '3가지 질문에 차례로 답해요',
  },
};

const LEVEL_LABELS = ['Level 1', 'Level 2', 'Level 3', 'Level 4'];

export default function LevelSuggestScreen() {
  const router = useRouter();
  const { nickname, selectedLevel, setSelectedLevel } = useOnboardingStore();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetSelected, setSheetSelected] = useState(selectedLevel);

  const info = LEVEL_INFO[selectedLevel] ?? LEVEL_INFO[1];

  function handleConfirmSheet() {
    setSelectedLevel(sheetSelected);
    setSheetVisible(false);
  }

  function handleStart() {
    router.push('/onboarding/mode-intro');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
        <Text style={styles.heading}>{nickname}에게 딱 맞는{'\n'}단계를 찾았어요!</Text>

        <View style={{ height: Spacing.sm }} />

        {/* 레벨 카드 */}
        <View style={styles.levelCard}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>{info.label}</Text>
          </View>
          <View style={{ height: Spacing.sm }} />
          <Text style={styles.levelQuestion}>{info.question}</Text>
          <Text style={styles.levelStarter}>{info.starter}</Text>
        </View>

        <View style={{ height: Spacing.sm }} />
        <Text style={styles.hint}>나중에 언제든 바꿀 수 있어요</Text>
      </ScrollView>

      <View style={styles.ctaArea}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleStart}
          accessibilityLabel="이 단계로 시작하기"
        >
          <Text style={styles.primaryButtonText}>이 단계로 시작하기</Text>
        </TouchableOpacity>
        <View style={{ height: Spacing.sm }} />
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setSheetVisible(true)}
          accessibilityLabel="다른 단계 선택하기"
        >
          <Text style={styles.secondaryButtonText}>다른 단계 선택하기</Text>
        </TouchableOpacity>
      </View>

      {/* 레벨 선택 Bottom Sheet */}
      <Modal
        visible={sheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSheetVisible(false)}
      >
        <Pressable style={styles.scrim} onPress={() => setSheetVisible(false)} />
        <View style={styles.sheet}>
          <View style={styles.dragHandle} />
          <Text style={styles.sheetHeading}>단계를 선택해주세요</Text>
          {[1, 2, 3, 4].map((lvl) => (
            <TouchableOpacity
              key={lvl}
              style={styles.sheetItem}
              onPress={() => setSheetSelected(lvl)}
              accessibilityRole="radio"
              accessibilityState={{ selected: sheetSelected === lvl }}
            >
              <Text
                style={[
                  styles.sheetItemText,
                  sheetSelected === lvl && styles.sheetItemTextSelected,
                ]}
              >
                {LEVEL_LABELS[lvl - 1]}
              </Text>
              {sheetSelected === lvl ? (
                <Text style={styles.checkMark}>✓</Text>
              ) : null}
            </TouchableOpacity>
          ))}
          <View style={{ height: Spacing.md }} />
          <TouchableOpacity
            style={styles.sheetConfirmButton}
            onPress={handleConfirmSheet}
          >
            <Text style={styles.primaryButtonText}>확인</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: ParentColors.background },
  flex: { flex: 1 },
  content: { padding: Spacing['2xl'], paddingTop: Spacing.xl },
  heading: { ...TextStyle.heading1, color: ParentColors.textPrimary },
  levelCard: {
    borderWidth: 1.5,
    borderColor: ParentColors.primaryLight,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    backgroundColor: 'rgba(255,212,194,0.1)',
    ...Shadow.level1,
    shadowColor: '#000',
  },
  levelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: ParentColors.primaryLight,
    borderRadius: Radius.xs,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  levelBadgeText: { ...TextStyle.caption, color: ParentColors.primary },
  levelQuestion: { ...TextStyle.title, color: ParentColors.textPrimary, marginBottom: Spacing.xs },
  levelStarter: { ...TextStyle.body, color: ParentColors.textSecondary },
  hint: { ...TextStyle.caption, color: ParentColors.textSecondary, textAlign: 'center' },
  ctaArea: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  primaryButton: {
    height: ComponentSize.buttonHeight,
    backgroundColor: ParentColors.primary,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: { ...ModeTypography.buttonLabel, color: ParentColors.textOnPrimary },
  secondaryButton: {
    height: ComponentSize.buttonHeight,
    borderWidth: 1.5,
    borderColor: ParentColors.divider,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ParentColors.background,
  },
  secondaryButtonText: { ...ModeTypography.buttonLabel, color: ParentColors.textPrimary },
  // Sheet
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(26,26,26,0.5)',
  },
  sheet: {
    backgroundColor: ParentColors.background,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing['2xl'],
    paddingTop: Spacing.md,
    ...Shadow.level2,
    shadowColor: '#000',
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: ParentColors.dividerStrong,
    borderRadius: Radius.full,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  sheetHeading: {
    ...TextStyle.title,
    color: ParentColors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  sheetItem: {
    height: ComponentSize.topBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
    borderBottomWidth: 1,
    borderBottomColor: ParentColors.divider,
  },
  sheetItemText: { ...TextStyle.body, color: ParentColors.textPrimary, flex: 1 },
  sheetItemTextSelected: { color: ParentColors.primary },
  checkMark: { ...TextStyle.body, color: ParentColors.primary },
  sheetConfirmButton: {
    height: ComponentSize.buttonHeight,
    backgroundColor: ParentColors.primary,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
