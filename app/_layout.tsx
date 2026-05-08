import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { supabase } from '../src/services/supabase';
import { useAuthStore } from '../src/stores/auth.store';
import { getChildProfile } from '../src/services/auth.service';
import { getDb } from '../src/db/client';
import { syncCardsCache } from '../src/services/card.service';
import { useSync } from '../src/hooks/useSync';
import { fetchUnseenPraises } from '../src/services/praise.service';
import { usePraiseStore } from '../src/stores/praise.store';
import { registerPushToken } from '../src/services/notification.service';
import { useNotificationStore } from '../src/stores/notification.store';
import { initPurchases } from '../src/services/purchase.service';
import { useSubscriptionStore } from '../src/stores/subscription.store';
import type { ParentPraise } from '../src/types/db.types';

export default function RootLayout() {
  const { setSession, setChildProfile, setLoading, childProfile } = useAuthStore();
  const router = useRouter();
  useSync();

  useEffect(() => {
    // 알림 설정 로드
    useNotificationStore.getState().loadPrefs();

    // SQLite 초기화 + 카드 캐시 동기화
    getDb()
      .then(() => syncCardsCache())
      .catch(() => {});

    // 앱 시작 시 현재 세션 확인
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) {
        try {
          const profile = await getChildProfile(session.user.id);
          setChildProfile(profile);
        } catch {
          setChildProfile(null);
        }
        // 푸시 토큰 등록
        registerPushToken(session.user.id).catch(() => {});
        // RevenueCat 초기화 + 구독 확인
        initPurchases(session.user.id).then(() =>
          useSubscriptionStore.getState().checkSubscription(session.user.id)
        ).catch(() => {});
      }
      setLoading(false);
    });

    // 인증 상태 변경 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session) {
          try {
            const profile = await getChildProfile(session.user.id);
            setChildProfile(profile);
          } catch {
            setChildProfile(null);
          }
          if (event === 'SIGNED_IN') {
            registerPushToken(session.user.id).catch(() => {});
            initPurchases(session.user.id).then(() =>
              useSubscriptionStore.getState().checkSubscription(session.user.id)
            ).catch(() => {});
          }
        } else {
          setChildProfile(null);
        }
        setLoading(false);
      }
    );

    // 알림 탭 시 딥링크 처리
    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, string>;
      if (!data?.screen) return;
      if (data.screen === 'parent-record' && data.recordId) {
        router.push(`/(parent)/records/${data.recordId}` as any);
      } else if (data.screen === 'child-today') {
        router.push('/(child)/today' as any);
      }
    });

    return () => {
      subscription.unsubscribe();
      responseSub.remove();
    };
  }, []);

  // 칭찬 Realtime 구독 + AppState fallback 폴링
  useEffect(() => {
    const childId = childProfile?.child_id;
    if (!childId) return;

    const { setUnseenPraises, addPraise } = usePraiseStore.getState();

    // 초기 미확인 칭찬 로드
    fetchUnseenPraises(childId).then(setUnseenPraises).catch(() => {});

    // Realtime INSERT 구독
    const channel = supabase
      .channel(`praises-${childId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'parent_praises', filter: `child_id=eq.${childId}` },
        (payload) => { addPraise(payload.new as ParentPraise); }
      )
      .subscribe();

    // 포그라운드 복귀 시 fallback 폴링
    const handleAppState = (state: AppStateStatus) => {
      if (state === 'active') {
        fetchUnseenPraises(childId).then(setUnseenPraises).catch(() => {});
      }
    };
    const appStateSub = AppState.addEventListener('change', handleAppState);

    return () => {
      channel.unsubscribe();
      appStateSub.remove();
    };
  }, [childProfile?.child_id]);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="experience" />
        <Stack.Screen name="role" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="child-experience" />
        <Stack.Screen name="(parent)" />
        <Stack.Screen name="(child)" />
      </Stack>
    </SafeAreaProvider>
  );
}
