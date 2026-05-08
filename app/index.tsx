// 0-1 스플래시 — 세션 분기
// 미로그인 → /experience | 부모 로그인 → /(parent)/home | onboarding 미완료 → /onboarding/login
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/auth.store';
import { ParentColors } from '../src/design/tokens';

export default function SplashScreen() {
  const router = useRouter();
  const { session, childProfile, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    if (!session) {
      router.replace('/experience');
      return;
    }

    if (!childProfile?.onboarding_completed) {
      router.replace('/onboarding/login');
      return;
    }

    router.replace('/(parent)/home');
  }, [isLoading, session, childProfile]);

  return (
    <View style={{ flex: 1, backgroundColor: ParentColors.background, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator color={ParentColors.primary} />
    </View>
  );
}
