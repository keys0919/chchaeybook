import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useProfileStore } from '../src/stores/profile.store';
import { ChildColors } from '../src/design/tokens';

export default function SplashScreen() {
  const router = useRouter();
  const { profile, isLoading } = useProfileStore();

  useEffect(() => {
    if (isLoading) return;
    if (!profile) {
      router.replace('/setup');
    } else {
      router.replace('/(child)/today');
    }
  }, [isLoading, profile]);

  return (
    <View style={{ flex: 1, backgroundColor: ChildColors.background, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator color={ChildColors.primary} />
    </View>
  );
}
