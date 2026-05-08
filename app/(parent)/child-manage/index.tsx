// C-12 자녀관리 홈 — 프로필 수정 / 레벨 변경 / 주간 목표 설정
import { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ParentColors, Spacing, Radius, ComponentSize } from '../../../src/design/tokens';
import { TextStyle, ModeTypography } from '../../../src/design/typography';
import { useAuthStore } from '../../../src/stores/auth.store';
import { useGoalStore } from '../../../src/stores/goal.store';

const GOAL_OPTIONS = [1, 2, 3, 4, 5, 6, 7];

export default function ChildManageScreen() {
  const router = useRouter();
  const { childProfile } = useAuthStore();
  const { weeklyGoal, loadGoal, setWeeklyGoal } = useGoalStore();
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [savingGoal, setSavingGoal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (childProfile) loadGoal(childProfile.child_id);
    }, [childProfile?.child_id])
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

  const handleGoalSelect = async (goal: number) => {
    setSavingGoal(true);
    await setWeeklyGoal(childProfile.child_id, goal);
    setSavingGoal(false);
    setGoalModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>자녀관리</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* 자녀 정보 요약 */}
        <View style={styles.profileSummary}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{childProfile.nickname.charAt(0)}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{childProfile.nickname}</Text>
            <Text style={styles.profileMeta}>
              {childProfile.grade ?? '학년 미설정'} · Level {childProfile.current_level}
            </Text>
          </View>
        </View>

        <View style={{ height: Spacing.lg }} />

        {/* 관리 항목 */}
        <View style={styles.group}>
          <Text style={styles.groupLabel}>프로필</Text>
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push('/(parent)/child-manage/profile' as any)}
          >
            <Text style={styles.rowLabel}>닉네임 · 학년 수정</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push('/(parent)/child-manage/level' as any)}
          >
            <Text style={styles.rowLabel}>레벨 수동 변경</Text>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>Lv.{childProfile.current_level}</Text>
              <Text style={styles.rowArrow}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: Spacing.md }} />

        <View style={styles.group}>
          <Text style={styles.groupLabel}>학습 목표</Text>
          <TouchableOpacity
            style={styles.row}
            onPress={() => setGoalModalVisible(true)}
          >
            <Text style={styles.rowLabel}>이번 주 목표</Text>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>주 {weeklyGoal}회</Text>
              <Text style={styles.rowArrow}>›</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 주간 목표 선택 모달 */}
      <Modal
        visible={goalModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setGoalModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setGoalModalVisible(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>이번 주 목표 설정</Text>
            <Text style={styles.modalSubtitle}>아이와 함께 달성 가능한 목표를 정해보세요.</Text>
            <View style={{ height: Spacing.md }} />
            {GOAL_OPTIONS.map((n) => (
              <TouchableOpacity
                key={n}
                style={[styles.goalOption, weeklyGoal === n && styles.goalOptionSelected]}
                onPress={() => handleGoalSelect(n)}
                disabled={savingGoal}
              >
                <Text
                  style={[
                    styles.goalOptionText,
                    weeklyGoal === n && styles.goalOptionTextSelected,
                  ]}
                >
                  주 {n}회
                </Text>
                {weeklyGoal === n ? <Text style={styles.goalOptionCheck}>✓</Text> : null}
              </TouchableOpacity>
            ))}
            <View style={{ height: Spacing.lg }} />
          </Pressable>
        </Pressable>
      </Modal>
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  profileSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: ParentColors.surface1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: ParentColors.divider,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: ParentColors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { ...TextStyle.heading2, color: ParentColors.primary, fontWeight: '700' },
  profileInfo: { gap: 4 },
  profileName: { ...TextStyle.heading2, color: ParentColors.textPrimary },
  profileMeta: { ...TextStyle.caption, color: ParentColors.textTertiary },
  group: {
    backgroundColor: ParentColors.surface1,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: ParentColors.divider,
    overflow: 'hidden',
  },
  groupLabel: {
    ...TextStyle.caption,
    color: ParentColors.textTertiary,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: 4,
    backgroundColor: ParentColors.background,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: ParentColors.divider,
  },
  rowLabel: { ...TextStyle.body, color: ParentColors.textPrimary },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  rowValue: { ...TextStyle.body, color: ParentColors.textTertiary },
  rowArrow: { ...TextStyle.body, color: ParentColors.textTertiary, marginLeft: 2 },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: ParentColors.background,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    padding: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: ParentColors.divider,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: { ...TextStyle.heading2, color: ParentColors.textPrimary, marginBottom: 4 },
  modalSubtitle: { ...TextStyle.body, color: ParentColors.textSecondary },
  goalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.sm,
  },
  goalOptionSelected: { backgroundColor: ParentColors.primaryLight },
  goalOptionText: { ...TextStyle.body, color: ParentColors.textPrimary },
  goalOptionTextSelected: { color: ParentColors.primary, fontWeight: '700' },
  goalOptionCheck: { ...TextStyle.label, color: ParentColors.primary, fontWeight: '700' },
});
