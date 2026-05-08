import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { getDb } from '../db/client';
import { getMediaCount } from '../db/queries/media-items';
import type { MediaQuota } from '../types/media.types';
import { MEDIA_QUOTA } from '../types/media.types';

export function useMediaQuota(childId: string): MediaQuota & { refresh: () => void } {
  const [count, setCount] = useState(0);

  const load = useCallback(() => {
    if (!childId) return;
    getDb()
      .then((db) => getMediaCount(db, childId))
      .then(setCount)
      .catch(() => {});
  }, [childId]);

  useFocusEffect(load);

  return {
    count,
    isNearLimit: count >= MEDIA_QUOTA.WARNING_THRESHOLD,
    isAtLimit: count >= MEDIA_QUOTA.HARD_LIMIT,
    refresh: load,
  };
}
