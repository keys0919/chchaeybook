// C-13 자녀 프로필 수정 — 닉네임 / 학년
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
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
import { updateChildNickname, updateChildGrade } from '../../../src/services/child-profile.service';

const GRADE_OPTIONS = [
  '미취학', '초1', '초2', '초3', '초4', '초5', '초6',
  '중1', '중2', '중3',
];

export default function ProfileEditScreen() {
  const router = useRouter();
  const { childProfile, setChildProfile } = useAuthStore();

  const [nickname, setNickname] = useState(childProfile?.nickname ?? '');
  const [grade, setGrade] = useState(childProfile?.grade ?? '');
  const [saving, setSaving] = useState(false);

  if (!childProfile) return null;

  const hasChanged =
    nickname.trim() !== childProfile.nickname ||
    grade !== (childProfile.grade ?? '');

  const handleSave = async () => {
    if (!nickname.trim()) {
      Alert.alert('닉네임을 입력해주세요.');
      return;
    }
    setSaving(true);
    try {
      const updates: Promise<void>[] = [];
      if (nickname.trim() !== childProfile.nickname) {
        updates.push(updateChildNickname(childProfile.child_id, nickname.trim()));
      }
      if (grade !== (childProfile.grade ?? '')) {
        updates.push(updateChildGrade(childProfile.child_id, grade));
      }
      await Promise.all(updates);
      setChildProfile({ ...childProfile, nickname: nickname.trim(), grade: grade || null });
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
        <Text style={styles.headerTitle}>프로필 수정</Text>
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

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* 닉네임 */}
        <Text style={styles.fieldLabel}>닉네임</Text>
        <TextInput
          style={styles.input}
          value={nickname}
          onChangeText={setNickname}
          placeholder="아이 닉네임"
          placeholderTextColor={ParentColors.textTertiary}
          maxLength={20}
          returnKeyType="done"
        />
        <Text style={styles.fieldHint}>앱 내에서 아이를 부를 때 사용해요.</Text>

        <View style={{ height: Spacing.xl }} />

        {/* 학년 선택 */}
        <Text style={styles.fieldLabel}>학년</Text>
        <View style={styles.gradeGrid}>
          {GRADE_OPTIONS.map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.gradeOption, grade === g && styles.gradeOptionSelected]}
              onPress={() => setGrade(g)}
            >
              <Text
                style={[
                  styles.gradeOptionText,
                  grade === g && styles.gradeOptionTextSelected,
                ]}
              >
                {g}
              </Text>
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
  backBtn: { width: 56 },
  backText: { ...TextStyle.body, color: ParentColors.textSecondary },
  headerTitle: { ...TextStyle.heading2, color: ParentColors.textPrimary },
  saveBtn: { width: 56, alignItems: 'flex-end' },
  saveText: { ...TextStyle.body, color: ParentColors.primary, fontWeight: '700' },
  saveTextDisabled: { color: ParentColors.textTertiary },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  fieldLabel: {
    ...TextStyle.label,
    color: ParentColors.textSecondary,
    marginBottom: Spacing.sm,
  },
  input: {
    height: ComponentSize.inputHeight,
    backgroundColor: ParentColors.surface1,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: ParentColors.divider,
    paddingHorizontal: Spacing.md,
    ...TextStyle.body,
    color: ParentColors.textPrimary,
  },
  fieldHint: {
    ...TextStyle.caption,
    color: ParentColors.textTertiary,
    marginTop: Spacing.xs,
  },
  gradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  gradeOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: ParentColors.divider,
    backgroundColor: ParentColors.surface1,
  },
  gradeOptionSelected: {
    borderColor: ParentColors.primary,
    backgroundColor: ParentColors.primaryLight,
  },
  gradeOptionText: { ...TextStyle.label, color: ParentColors.textSecondary },
  gradeOptionTextSelected: { color: ParentColors.primary, fontWeight: '700' },
});
