// B-1 아이 체험 모드 진입 — 로컬 임시 프로필 생성 (child_id='guest_XXX')
import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { ChildColors, Spacing } from '../../src/design/tokens';
import { TextStyle } from '../../src/design/typography';
import { useAuthStore } from '../../src/stores/auth.store';

export default function ChildExperienceEntryScreen() {
  const router = useRouter();
  const { setChildProfile } = useAuthStore();

  useEffect(() => {
    // 로컬 임시 프로필 생성
    const guestId = `guest_${Crypto.randomUUID().replace(/-/g, '').slice(0, 8)}`;
    setChildProfile({
      child_id: guestId,
      parent_id: '',
      nickname: '체험 아이',
      grade: null,
      current_level: 1,
      onboarding_completed: false,
    });
    router.replace('/child-experience/card');
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ActivityIndicator color={ChildColors.primary} />
        <Text style={styles.text}>체험 모드 준비 중...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: ChildColors.background },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  text: {
    ...TextStyle.body,
    color: ChildColors.textSecondary,
  },
});
