import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { ChildColors, Spacing, Radius, ComponentSize } from '../../src/design/tokens';
import { TextStyle, ModeTypography, FontFamily } from '../../src/design/typography';
import { useProfileStore } from '../../src/stores/profile.store';
import { exportAllData } from '../../src/db/index';

const LEVELS: Array<{ level: number; label: string }> = [
  { level: 1, label: 'Lv.1  처음 써봐요' },
  { level: 2, label: 'Lv.2  조금 써봤어요' },
  { level: 3, label: 'Lv.3  꽤 써봤어요' },
  { level: 4, label: 'Lv.4  잘 쓸 수 있어요' },
];

const PROFILE_KEY = 'booksok_profile';

export default function SettingsScreen() {
  const { profile, load } = useProfileStore();
  const [displayLevel, setDisplayLevel] = useState<number>(profile?.current_level ?? 1);

  useEffect(() => {
    if (profile?.current_level !== undefined) {
      setDisplayLevel(profile.current_level);
    }
  }, [profile?.current_level]);

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
    }
  };

  const handleLevelChange = (level: number) => {
    setDisplayLevel(level);
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (!raw) return;
      const p = JSON.parse(raw);
      p.current_level = level;
      localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
      load();
    } catch {}
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
            <Text style={styles.profileDetail}>{profile.grade} · Level {displayLevel}</Text>
          </View>
        ) : null}

        <View style={{ height: Spacing.xl }} />

        <Text style={styles.sectionLabel}>레벨 변경</Text>
        <View style={{ height: Spacing.sm }} />
        <View style={styles.levelGrid}>
          {LEVELS.map((item) => {
            const isSelected = displayLevel === item.level;
            return (
              <TouchableOpacity
                key={item.level}
                style={[styles.levelBtn, isSelected && styles.levelBtnSelected]}
                onPress={() => handleLevelChange(item.level)}
                disabled={isSelected}
              >
                <Text style={[styles.levelBtnText, isSelected && styles.levelBtnTextSelected]}>
                  {item.label}
                </Text>
                {isSelected && <Text style={styles.currentBadge}>현재</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

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

  sectionLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: 13,
    fontWeight: '600',
    color: ChildColors.textTertiary,
    letterSpacing: 0.2,
  },
  levelGrid: { gap: Spacing.xs },
  levelBtn: {
    height: ComponentSize.buttonHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    backgroundColor: ChildColors.surface1,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  levelBtnSelected: {
    borderColor: ChildColors.primary,
    backgroundColor: '#FFF8F5',
  },
  levelBtnText: {
    fontFamily: FontFamily.semibold,
    fontSize: 15,
    fontWeight: '600',
    color: ChildColors.textPrimary,
  },
  levelBtnTextSelected: { color: ChildColors.primary },
  currentBadge: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    fontWeight: '700',
    color: ChildColors.primary,
    backgroundColor: ChildColors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },

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
