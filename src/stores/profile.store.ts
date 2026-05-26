// 단일 아이 프로필 — localStorage 기반, 인증 불필요
import { create } from 'zustand';

export interface ChildProfile {
  child_id: string;
  nickname: string;
  current_level: number;
  grade: string;
}

const PROFILE_KEY = 'booksok_profile';
const LEVEL_UP_THRESHOLD = 8;
const MAX_LEVEL = 4;

function loadFromStorage(): ChildProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as ChildProfile) : null;
  } catch {
    return null;
  }
}

function saveToStorage(profile: ChildProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

interface ProfileStore {
  profile: ChildProfile | null;
  isLoading: boolean;
  load: () => void;
  createProfile: (nickname: string) => ChildProfile;
  levelUp: () => void;
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: null,
  isLoading: true,

  load: () => {
    const profile = loadFromStorage();
    set({ profile, isLoading: false });
  },

  createProfile: (nickname: string) => {
    const profile: ChildProfile = {
      child_id: crypto.randomUUID(),
      nickname,
      current_level: 1,
      grade: '4학년',
    };
    saveToStorage(profile);
    set({ profile });
    return profile;
  },

  levelUp: () => {
    const { profile } = get();
    if (!profile) return;
    if (profile.current_level >= MAX_LEVEL) return;
    const updated: ChildProfile = { ...profile, current_level: profile.current_level + 1 };
    saveToStorage(updated);
    set({ profile: updated });
  },
}));

export { LEVEL_UP_THRESHOLD, MAX_LEVEL };
