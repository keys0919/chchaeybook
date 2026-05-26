import { create } from 'zustand';
import type { Card, CardInputMode } from '../types/card.types';

interface WritingSession {
  bookTitle: string;
  author: string | null;
  level: number;
  card: Card | null;
  draftId: string;
  inputMode: CardInputMode;
  sentences: string[];
  selectedHints: string[];
  sessionIndex: number;
}

interface SessionStore {
  session: WritingSession | null;
  startSession: (
    bookTitle: string,
    author: string | null,
    level: number,
    sessionIndex?: number,
    draftId?: string | null
  ) => void;
  setCard: (card: Card) => void;
  setInputMode: (mode: CardInputMode) => void;
  setSentences: (sentences: string[]) => void;
  setSelectedHints: (hints: string[]) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  session: null,
  startSession: (bookTitle, author, level, sessionIndex = 1, draftId = null) =>
    set({
      session: {
        bookTitle,
        author,
        level,
        card: null,
        draftId: draftId ?? crypto.randomUUID(),
        inputMode: 'text',
        sentences: [],
        selectedHints: [],
        sessionIndex,
      },
    }),
  setCard: (card) =>
    set((state) => (state.session ? { session: { ...state.session, card } } : state)),
  setInputMode: (inputMode) =>
    set((state) => (state.session ? { session: { ...state.session, inputMode } } : state)),
  setSentences: (sentences) =>
    set((state) => (state.session ? { session: { ...state.session, sentences } } : state)),
  setSelectedHints: (selectedHints) =>
    set((state) => (state.session ? { session: { ...state.session, selectedHints } } : state)),
  clearSession: () => set({ session: null }),
}));
