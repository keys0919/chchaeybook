import {
  upsertDraft,
  deleteDraft,
  cleanExpiredDrafts,
  getMeaningfulDrafts,
} from '../db/index';
import type { Draft, PartialInput } from '../types/db.types';

export function isMeaningful(input: PartialInput | null, cardType: string): boolean {
  if (!input) return false;
  if (cardType === 'blank') return true;
  if (input.type === 'text') return (input.text?.trim().length ?? 0) >= 3;
  return false;
}

export function saveDraft(draft: Draft): void {
  upsertDraft(draft);
}

export function removeDraft(draftId: string): void {
  deleteDraft(draftId);
}

export function loadMeaningfulDrafts(childId: string): Draft[] {
  cleanExpiredDrafts();
  return getMeaningfulDrafts(childId);
}
