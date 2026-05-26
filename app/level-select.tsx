import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useProfileStore } from '../src/stores/profile.store';
import { ChildColors, Spacing, Radius, ComponentSize, Shadow } from '../src/design/tokens';
import { TextStyle, ModeTypography, FontFamily } from '../src/design/typography';

const LEVELS: Array<{
  level: number;
  label: string;
  desc: string;
  grade: string;
  recommended?: boolean;
}> = [
  { level: 1, label: '처음 써봐요', desc: '독서록이 처음이에요', grade: '1~2학년' },
  { level: 2, label: '조금 써봤어요', desc: '짧은 문장은 쓸 수 있어요', grade: '2~3학년' },
  { level: 3, label: '꽤 써봤어요', desc: '생각을 이어서 쓸 수 있어요', grade: '3학년' },
  { level: 4, label: '잘 쓸 수 있어요', desc: '이유와 근거를 붙여 쓸 수 있어요', grade: '4학년', recommended: true },
];

export default function LevelSelectScreen() {
  const router = useRouter();
  const { nickname } = useLocalSearchParams<{ nickname: string }>();
  const { createProfile } = useProfileStore();
  const [selected, setSelected] = useState<number>(4);

  const handleStart = () => {
    if (!nickname) return;
    createProfile(nickname, selected);
    router.replace('/(child)/today');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>{nickname}, 지금 실력이 어느 정도예요?</Text>
        <Text style={styles.sub}>나중에 레벨을 바꿀 수 있어요</Text>

        <View style={{ height: Spacing.xl }} />

        <View style={styles.levelList}>
          {LEVELS.map((item) => {
            const isSelected = selected === item.level;
            return (
              <TouchableOpacity
                key={item.level}
                style={[
                  styles.levelCard,
                  isSelected && styles.levelCardSelected,
                ]}
                onPress={() => setSelected(item.level)}
                activeOpacity={0.7}
              >
                <View style={styles.levelCardLeft}>
                  <View style={styles.levelRow}>
                    <Text style={[styles.levelLabel, isSelected && styles.levelLabelSelected]}>
                      Lv.{item.level}
                    </Text>
                    {item.recommended && (
                      <View style={styles.recommendedBadge}>
                        <Text style={styles.recommendedText}>4학년 추천</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.levelName, isSelected && styles.levelNameSelected]}>
                    {item.label}
                  </Text>
                  <Text style={[styles.levelDesc, isSelected && styles.levelDescSelected]}>
                    {item.desc}
                  </Text>
                </View>
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: Spacing.xl }} />

        <TouchableOpacity style={styles.btn} onPress={handleStart}>
          <Text style={styles.btnText}>Lv.{selected}로 시작하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: ChildColors.background },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },

  heading: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    fontWeight: '700',
    color: ChildColors.textPrimary,
    letterSpacing: -0.3,
    lineHeight: 32,
  },
  sub: {
    ...TextStyle.body,
    color: ChildColors.textSecondary,
    marginTop: 6,
  },

  levelList: { gap: Spacing.sm },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ChildColors.surface1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Shadow.level1,
    shadowColor: '#1A1A1A',
  },
  levelCardSelected: {
    borderColor: ChildColors.primary,
    backgroundColor: '#FFF8F5',
  },
  levelCardLeft: { flex: 1, gap: 3 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  levelLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 13,
    fontWeight: '700',
    color: ChildColors.textTertiary,
  },
  levelLabelSelected: { color: ChildColors.primary },
  recommendedBadge: {
    backgroundColor: ChildColors.primaryLight,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  recommendedText: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    fontWeight: '700',
    color: ChildColors.primary,
  },
  levelName: {
    fontFamily: FontFamily.semibold,
    fontSize: 16,
    fontWeight: '600',
    color: ChildColors.textPrimary,
  },
  levelNameSelected: { color: ChildColors.textPrimary },
  levelDesc: {
    ...TextStyle.caption,
    color: ChildColors.textSecondary,
  },
  levelDescSelected: { color: ChildColors.textSecondary },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: ChildColors.divider,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.md,
  },
  radioSelected: { borderColor: ChildColors.primary },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ChildColors.primary,
  },

  btn: {
    height: ComponentSize.buttonHeight,
    backgroundColor: ChildColors.primary,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: { ...ModeTypography.buttonLabel, color: ChildColors.textOnPrimary },
});
