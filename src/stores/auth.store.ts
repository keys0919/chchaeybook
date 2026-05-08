import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';

interface ChildProfile {
  child_id: string;
  parent_id: string;
  nickname: string;
  grade: string | null;
  current_level: number;
  onboarding_completed: boolean;
}

interface AuthStore {
  session: Session | null;
  childProfile: ChildProfile | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setChildProfile: (profile: ChildProfile | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  childProfile: null,
  isLoading: true,
  setSession: (session) => set({ session }),
  setChildProfile: (childProfile) => set({ childProfile }),
  setLoading: (isLoading) => set({ isLoading }),
  signOut: () => set({ session: null, childProfile: null }),
}));
