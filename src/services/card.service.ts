// 카드 서비스 — 번들 데이터 기반 (Supabase 제거)
import { getCardsByLevel, getAllCards } from '../data/cards';
import { logCardUsage as dbLog, getRecentlyUsedCardIds } from '../db/index';
import type { Card } from '../types/card.types';

export { getCardsByLevel, getAllCards };

export function logCardUsage(childId: string, cardId: string): void {
  dbLog(childId, cardId);
}

function pickCard(
  candidates: Card[],
  recentIds: string[],
  lastCategory: string | null
): Card | null {
  if (candidates.length === 0) return null;
  const recentSet = new Set(recentIds);

  const fresh = candidates.filter(
    (c) => !recentSet.has(c.card_id) && c.category !== lastCategory
  );
  if (fresh.length > 0) return fresh[Math.floor(Math.random() * fresh.length)];

  const unused = candidates.filter((c) => !recentSet.has(c.card_id));
  if (unused.length > 0) return unused[Math.floor(Math.random() * unused.length)];

  return candidates[Math.floor(Math.random() * candidates.length)];
}

export function pickCardForLevel(
  level: number,
  childId: string,
  lastCategory: string | null = null
): Card | null {
  const cards = getCardsByLevel(level);
  const recentIds = getRecentlyUsedCardIds(childId, 5);
  return pickCard(cards, recentIds, lastCategory);
}
