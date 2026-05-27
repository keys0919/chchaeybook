import { getCardForSession, logCardUsage } from '../services/card.service';
import type { Card } from '../types/card.types';

interface UseCardResult {
  card: Card | null;
  loading: boolean;
  error: string | null;
}

export function useCard(
  level: number,
  childId: string,
  sessionIndex: number
): UseCardResult {
  if (!childId) return { card: null, loading: false, error: null };
  const card = getCardForSession(level, sessionIndex);
  return {
    card,
    loading: false,
    error: card ? null : '카드를 불러올 수 없어요.',
  };
}

export { logCardUsage };
