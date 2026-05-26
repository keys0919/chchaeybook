import { useCallback, useEffect, useRef } from 'react';
import type { PartialInput } from '../types/db.types';
import { saveDraft, isMeaningful } from '../services/draft.service';

interface UseDraftParams {
  draftId: string;
  childId: string;
  bookTitle: string;
  level: number;
  cardId: string | null;
  cardType: string;
}

export function useDraft({ draftId, childId, bookTitle, level, cardId, cardType }: UseDraftParams) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestInputRef = useRef<PartialInput | null>(null);
  const createdAtRef = useRef(new Date().toISOString());

  const save = useCallback(
    (input: PartialInput | null) => {
      const now = new Date().toISOString();
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      saveDraft({
        draft_id: draftId,
        child_id: childId,
        book_title: bookTitle,
        level,
        card_id: cardId,
        partial_input: input,
        input_mode: input?.type ?? 'text',
        is_meaningful: isMeaningful(input, cardType),
        expires_at: expires,
        created_at: createdAtRef.current,
        updated_at: now,
      });
    },
    [draftId, childId, bookTitle, level, cardId, cardType]
  );

  const scheduleSave = useCallback(
    (input: PartialInput | null) => {
      latestInputRef.current = input;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => save(latestInputRef.current), 1000);
    },
    [save]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { scheduleSave, saveImmediate: save };
}
