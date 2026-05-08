// C-14 레벨 수동 변경 + 앱 권장 안내
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ParentColors, Spacing, Radius, ComponentSize } from '../../../src/design/tokens';
import { TextStyle, ModeTypography } from '../../../src/design/typography';
import { useAuthStore } from '../../../src/stores/auth.store';
import { updateChildLevel } from '../../../src/services/child-profile.service';
import { COACHING_LEVELS } from '../../../src/data/coaching-content';

export default function LevelChangeScreen() {
  const router = useRouter();
  const { childProfile, setChildProfile } = useAuthStore();
  const [selectedLevel, setSelectedLevel] = useState(childProfile?.current_level ?? 1);
  const [saving, setSaving] = useState(false);

  if (!childProfile) return null;

  const hasChanged = selectedLevel !== childProfile.current_level;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateChildLevel(childProfile.child_id, selectedLevel);
      setChildProfile({ ...childProfile, current_level: selectedLevel });
      router.back();
    } catch {
      Alert.alert('저장에 실패했어요. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>취소</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>레벨 변경</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={!hasChanged || saving}
          style={styles.saveBtn}
        >
          {saving ? (
            <ActivityIndicator color={ParentColors.primary} size="small" />
          ) : (
            <Text style={[styles.saveText, (!hasChanged || saving) && styles.saveTextDisabled]}>
              저장
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* 앱 권장 안내 */}
        <View style={styles.recommendBox}>
          <Text style={styles.recommendTitle}>💡 앱 권장 레벨</Text>
          <Text style={styles.recommendBody}>
            앱은 아이의 쓰기 패턴을 분석해 레벨을 추천해요.
            현재 권장 레벨은 <Text style={styles.recommendLevel}>Lv.{childProfile.current_level}</Text>이에요.
            레벨을 수동으로 바꾸면 앱 추천이 초기화될 수 있어요.
          </Text>
        </View>

        <View style={{ height: Spacing.xl }} />

        <Text style={styles.selectLabel}>레벨 선택</Text>
        <View style={{ height: Spacing.sm }} />

        {COACHING_LEVELS.map((level) => (
          <TouchableOpacity
            key={level.level}
            style={[
              styles.levelOption,
              selectedLevel === level.level && styles.levelOptionSelected,
            ]}
            onPress={() => setSelectedLevel(level.level)}
          >
            <View style={styles.levelOptionLeft}>
              <View
                style={[
                  styles.levelBadge,
                  selectedLevel === level.level && styles.levelBadgeSelected,
                ]}
              >
                <Text
                  style={[
                    styles.levelBadgeText,
                    selectedLevel === level.level && styles.levelBadgeTextSelected,
                  ]}
                >
                  Lv.{level.level}
                </Text>
              </View>
              <View style={styles.levelOptionBody}>
                <Text style={styles.levelOptionTitle}>{level.label}</Text>
                <Text style={styles.levelOptionDesc} numberOfLines={1}>
                  {level.description}
                </Text>
              </View>
            </View>
            {selectedLevel === level.level ? (
              <Text style={styles.checkMark}>✓</Text>
            ) : null}
          </TouchableOpacity>
        ))}
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
  backBtn: { width: 56 },
  backText: { ...TextStyle.body, color: ParentColors.textSecondary },
  headerTitle: { ...TextStyle.heading2, color: ParentColors.textPrimary },
  saveBtn: { width: 56, alignItems: 'flex-end' },
  saveText: { ...TextStyle.body, color: ParentColors.primary, fontWeight: '700' },
  saveTextDisabled: { color: ParentColors.textTertiary },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  recommendBox: {
    backgroundColor: '#FFF8F5',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: ParentColors.primaryLight,
    gap: Spacing.xs,
  },
  recommendTitle: { ...TextStyle.label, color: ParentColors.primary, fontWeight: '700' },
  recommendBody: {
    ...TextStyle.body,
    color: ParentColors.textSecondary,
    lineHeight: 22,
  },
  recommendLevel: { color: ParentColors.primary, fontWeight: '700' },
  selectLabel: { ...TextStyle.label, color: ParentColors.textSecondary },
  levelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: ParentColors.surface1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1.5,
    borderColor: ParentColors.divider,
  },
  levelOptionSelected: {
    borderColor: ParentColors.primary,
    backgroundColor: '#FFF8F5',
  },
  levelOptionLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  levelBadge: {
    backgroundColor: ParentColors.surface2,
    borderRadius: Radius.xs,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 44,
    alignItems: 'center',
  },
  levelBadgeSelected: { backgroundColor: ParentColors.primaryLight },
  levelBadgeText: { ...TextStyle.label, color: ParentColors.textTertiary, fontWeight: '700' },
  levelBadgeTextSelected: { color: ParentColors.primary },
  levelOptionBody: { flex: 1 },
  levelOptionTitle: { ...TextStyle.label, color: ParentColors.textPrimary, fontWeight: '600' },
  levelOptionDesc: { ...TextStyle.caption, color: ParentColors.textTertiary, marginTop: 2 },
  checkMark: { ...TextStyle.label, color: ParentColors.primary, fontWeight: '700' },
});
