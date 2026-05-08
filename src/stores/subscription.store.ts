import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { isPremium, syncSubscriptionToSupabase } from '../services/purchase.service';

const CACHE_KEY = 'booksok_subscription_status';

interface SubscriptionStore {
  isPaid: boolean;
  isChecking: boolean;
  checkSubscription: (userId: string) => Promise<void>;
  setIsPaid: (paid: boolean) => void;
}

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  isPaid: false,
  isChecking: false,

  checkSubscription: async (userId: string) => {
    // 캐시 먼저 적용 (오프라인 fallback)
    try {
      const cached = await SecureStore.getItemAsync(CACHE_KEY);
      if (cached) set({ isPaid: cached === 'paid' });
    } catch {}

    set({ isChecking: true });
    try {
      const paid = await isPremium();
      set({ isPaid: paid });
      await SecureStore.setItemAsync(CACHE_KEY, paid ? 'paid' : 'free');
      await syncSubscriptionToSupabase(userId, paid);
    } catch {} finally {
      set({ isChecking: false });
    }
  },

  setIsPaid: (isPaid) => set({ isPaid }),
}));
