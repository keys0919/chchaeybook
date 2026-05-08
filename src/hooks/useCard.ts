import { useState, useEffect } from 'react';
import {
  getCardsByLevel,
  getRecentlyUsedCardIds,
  logCardUsage,
} from '../services/card.service';
import type { Card } from '../types/card.types';

interface UseCardResult {
  card: Card | null;
  loading: boolean;
  error: string | null;
}

// 최근 5회 제외 + 동일 카테고리 연속 방지 선택
function pickCard(
  candidates: Card[],
  recentIds: string[],
  lastCategory: string | null
): Card | null {
  if (candidates.length === 0) return null;

  const recentSet = new Set(recentIds);

  // 1순위: 최근 미사용 + 다른 카테고리
  const fresh = candidates.filter(
    (c) => !recentSet.has(c.card_id) && c.category !== lastCategory
  );
  if (fresh.length > 0) return fresh[Math.floor(Math.random() * fresh.length)];

  // 2순위: 최근 미사용 (카테고리 무관)
  const unused = candidates.filter((c) => !recentSet.has(c.card_id));
  if (unused.length > 0) return unused[Math.floor(Math.random() * unused.length)];

  // 3순위: 전체 중 랜덤 (모두 최근 사용된 경우)
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export function useCard(
  level: number,
  childId: string,
  lastCategory: string | null = null
): UseCardResult {
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!childId) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [cards, recentIds] = await Promise.all([
          getCardsByLevel(level),
          getRecentlyUsedCardIds(childId, 5),
        ]);

        if (cancelled) return;

        if (cards.length === 0) {
          setError('카드를 불러올 수 없어요.');
          return;
        }

        const picked = pickCard(cards, recentIds, lastCategory);
        setCard(picked);
      } catch {
        if (!cancelled) setError('카드 로딩 중 오류가 발생했어요.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [level, childId, lastCategory]);

  return { card, loading, error };
}

export { logCardUsage };
