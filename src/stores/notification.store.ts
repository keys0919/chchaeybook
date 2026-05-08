import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const PREF_KEY = 'booksok_notify_prefs';

export interface NotifyPrefs {
  praiseArrived: boolean;  // 칭찬 도착 → 아이 알림
  newRecord: boolean;       // 새 기록 → 부모 알림
  mediaShared: boolean;     // 미디어 공유 → 부모 알림
  mediaExpiry: boolean;     // 미디어 만료 7일 전 → 부모 알림
}

const DEFAULT_PREFS: NotifyPrefs = {
  praiseArrived: true,
  newRecord: true,
  mediaShared: true,
  mediaExpiry: true,
};

interface NotificationStore {
  prefs: NotifyPrefs;
  loadPrefs: () => Promise<void>;
  setPrefs: (partial: Partial<NotifyPrefs>) => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  prefs: DEFAULT_PREFS,
  loadPrefs: async () => {
    try {
      const raw = await SecureStore.getItemAsync(PREF_KEY);
      if (raw) set({ prefs: { ...DEFAULT_PREFS, ...JSON.parse(raw) } });
    } catch {}
  },
  setPrefs: async (partial) => {
    const updated = { ...get().prefs, ...partial };
    set({ prefs: updated });
    try {
      await SecureStore.setItemAsync(PREF_KEY, JSON.stringify(updated));
    } catch {}
  },
}));
