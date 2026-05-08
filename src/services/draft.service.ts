import { getDb } from '../db/client';
import {
  upsertDraft,
  deleteDraft,
  cleanExpiredDrafts,
  getMeaningfulDrafts,
} from '../db/queries/drafts';
import type { Draft, PartialInput } from '../types/db.types';

// blank(Level1): hint 선택 자체가 meaningful. text: 3자↑
export function isMeaningful(input: PartialInput | null, cardType: string): boolean {
  if (!input) return false;
  if (cardType === 'blank') return true;
  if (input.type === 'text') return (input.text?.trim().length ?? 0) >= 3;
  if (input.type === 'voice') return !!input.voice_path;
  if (input.type === 'photo') return !!input.photo_path;
  return false;
}

export async function saveDraft(draft: Draft): Promise<void> {
  const db = await getDb();
  await upsertDraft(db, draft);
}

export async function removeDraft(draftId: string): Promise<void> {
  const db = await getDb();
  await deleteDraft(db, draftId);
}

export async function loadMeaningfulDrafts(childId: string): Promise<Draft[]> {
  const db = await getDb();
  await cleanExpiredDrafts(db);
  return getMeaningfulDrafts(db, childId);
}
