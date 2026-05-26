// 카드 서비스 — 번들 데이터 기반 (Supabase 제거)
import { getCardsByLevel, getAllCards } from '../data/cards';
import { logCardUsage as dbLog } from '../db/index';
import type { Card } from '../types/card.types';

export { getCardsByLevel, getAllCards };

export function logCardUsage(childId: string, cardId: string): void {
  dbLog(childId, cardId);
}

// sessionIndex(1-based) → 해당 레벨 카드 배열의 고정 순서로 반환
export function getCardForSession(level: number, sessionIndex: number): Card | null {
  const cards = getCardsByLevel(level);
  if (cards.length === 0) return null;
  return cards[(sessionIndex - 1) % cards.length] ?? null;
}
