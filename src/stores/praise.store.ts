import { create } from 'zustand';
import type { ParentPraise } from '../types/db.types';

interface PraiseState {
  unseenPraises: ParentPraise[];
  unseenCount: number;
  setUnseenPraises: (praises: ParentPraise[]) => void;
  addPraise: (praise: ParentPraise) => void;
  clearUnseen: () => void;
}

export const usePraiseStore = create<PraiseState>((set, get) => ({
  unseenPraises: [],
  unseenCount: 0,
  setUnseenPraises: (praises) =>
    set({ unseenPraises: praises, unseenCount: praises.length }),
  addPraise: (praise) => {
    const next = [praise, ...get().unseenPraises];
    set({ unseenPraises: next, unseenCount: next.length });
  },
  clearUnseen: () => set({ unseenPraises: [], unseenCount: 0 }),
}));
