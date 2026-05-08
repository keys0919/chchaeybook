import * as Notifications from 'expo-notifications';
import { supabase } from './supabase';

// 포그라운드 알림 표시 설정 (모듈 로드 시 적용)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestPermission(): Promise<boolean> {
  const { status: current } = await Notifications.getPermissionsAsync();
  if (current === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function registerPushToken(userId: string): Promise<void> {
  const granted = await requestPermission();
  if (!granted) return;
  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync();
    await supabase
      .from('push_tokens')
      .upsert({ user_id: userId, token, updated_at: new Date().toISOString() });
  } catch {}
}

export async function scheduleLocalNotification(
  title: string,
  body: string,
  data: Record<string, string> = {}
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, data },
    trigger: null,
  });
}

// expiresAt이 7일 이내이면 즉시 로컬 알림, 7일 이상이면 7일 전에 예약
export async function scheduleExpiryNotificationIfNeeded(
  expiresAt: string,
  recordId: string
): Promise<void> {
  const expiryMs = new Date(expiresAt).getTime();
  const nowMs = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const diff = expiryMs - nowMs;

  if (diff <= 0) return; // 이미 만료

  const title = '아이가 보낸 기록이 곧 사라져요';
  const body = '7일 후 공유 파일이 삭제돼요. 지금 확인해보세요!';
  const data = { screen: 'parent-record', recordId };

  if (diff <= sevenDaysMs) {
    // 7일 이내 → 즉시 알림
    await scheduleLocalNotification(title, body, data);
  } else {
    // 7일 이상 → 7일 전에 예약
    const triggerDate = new Date(expiryMs - sevenDaysMs);
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
  }
}

export async function sendPushToUser(
  userId: string,
  title: string,
  body: string,
  data: Record<string, string> = {}
): Promise<void> {
  try {
    const { data: row } = await supabase
      .from('push_tokens')
      .select('token')
      .eq('user_id', userId)
      .single();

    if (row?.token) {
      const res = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ to: row.token, title, body, data }),
      });
      if (res.ok) return;
    }
  } catch {}
  // 토큰 없거나 전송 실패 → 로컬 알림 폴백
  await scheduleLocalNotification(title, body, data);
}
