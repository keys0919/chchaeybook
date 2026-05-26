import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert, Platform } from 'react-native';
import { ChildColors, Spacing, Radius, ComponentSize } from '../../src/design/tokens';
import { TextStyle, ModeTypography } from '../../src/design/typography';
import { useProfileStore } from '../../src/stores/profile.store';
import { exportAllData } from '../../src/db/index';

export default function SettingsScreen() {
  const { profile } = useProfileStore();

  const handleExport = () => {
    if (!profile) return;
    const json = exportAllData(profile.child_id);

    if (Platform.OS === 'web') {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `booksok-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      Alert.alert('내보내기', '웹에서만 지원해요.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>설정</Text>
      </View>

      <View style={styles.content}>
        {profile ? (
          <View style={styles.profileCard}>
            <Text style={styles.profileName}>{profile.nickname}</Text>
            <Text style={styles.profileDetail}>{profile.grade} · Level {profile.current_level}</Text>
          </View>
        ) : null}

        <View style={{ height: Spacing.xl }} />

        <TouchableOpacity style={styles.btn} onPress={handleExport}>
          <Text style={styles.btnText}>📥 독서록 내보내기 (JSON)</Text>
        </TouchableOpacity>
        <Text style={styles.hint}>모든 기록을 JSON 파일로 저장해요.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: ChildColors.background },
  header: {
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
    borderBottomWidth: 1,
    borderBottomColor: ChildColors.divider,
  },
  title: { ...TextStyle.heading2, color: ChildColors.textPrimary },
  content: { padding: Spacing['2xl'] },
  profileCard: {
    backgroundColor: ChildColors.surface1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 4,
  },
  profileName: { ...TextStyle.heading2, color: ChildColors.textPrimary },
  profileDetail: { ...TextStyle.body, color: ChildColors.textSecondary },
  btn: {
    height: ComponentSize.buttonHeight,
    backgroundColor: ChildColors.primaryLight,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  btnText: { ...ModeTypography.buttonLabel, color: ChildColors.primary },
  hint: {
    ...TextStyle.caption,
    color: ChildColors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
