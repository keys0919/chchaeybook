import { useState, useEffect } from 'react';
import { pickCardForLevel, logCardUsage } from '../services/card.service';
import type { Card } from '../types/card.types';

interface UseCardResult {
  card: Card | null;
  loading: boolean;
  error: string | null;
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
    setLoading(true);
    setError(null);
    const picked = pickCardForLevel(level, childId, lastCategory);
    if (!picked) {
      setError('카드를 불러올 수 없어요.');
    } else {
      setCard(picked);
    }
    setLoading(false);
  }, [level, childId, lastCategory]);

  return { card, loading, error };
}

export { logCardUsage };
