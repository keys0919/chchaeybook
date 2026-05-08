import { create } from 'zustand';
import type { AppMode } from '../design/mode';

interface ModeStore {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  toggleMode: () => void;
}

export const useModeStore = create<ModeStore>((set, get) => ({
  mode: 'parent',
  setMode: (mode) => set({ mode }),
  toggleMode: () => set({ mode: get().mode === 'parent' ? 'child' : 'parent' }),
}));
