import * as SQLite from 'expo-sqlite';
import type { Draft } from '../../types/db.types';

export async function upsertDraft(db: SQLite.SQLiteDatabase, draft: Draft) {
  await db.runAsync(
    `INSERT INTO drafts
      (draft_id, child_id, book_title, level, card_id, partial_input, input_mode,
       is_meaningful, expires_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(draft_id) DO UPDATE SET
       card_id = excluded.card_id,
       partial_input = excluded.partial_input,
       input_mode = excluded.input_mode,
       is_meaningful = excluded.is_meaningful,
       updated_at = excluded.updated_at`,
    [
      draft.draft_id,
      draft.child_id,
      draft.book_title,
      draft.level,
      draft.card_id ?? null,
      draft.partial_input ? JSON.stringify(draft.partial_input) : null,
      draft.input_mode ?? null,
      draft.is_meaningful ? 1 : 0,
      draft.expires_at,
      draft.created_at,
      draft.updated_at,
    ]
  );
}

export async function getMeaningfulDrafts(db: SQLite.SQLiteDatabase, childId: string): Promise<Draft[]> {
  const now = new Date().toISOString();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    `SELECT * FROM drafts
     WHERE child_id = ? AND expires_at > ? AND is_meaningful = 1
     ORDER BY updated_at DESC`,
    [childId, now]
  );
  return rows.map(deserializeDraft);
}

export async function deleteDraft(db: SQLite.SQLiteDatabase, draftId: string) {
  await db.runAsync('DELETE FROM drafts WHERE draft_id = ?', [draftId]);
}

export async function cleanExpiredDrafts(db: SQLite.SQLiteDatabase) {
  const now = new Date().toISOString();
  await db.runAsync("DELETE FROM drafts WHERE expires_at < ?", [now]);
}

function deserializeDraft(row: Record<string, unknown>): Draft {
  return {
    draft_id: row.draft_id as string,
    child_id: row.child_id as string,
    book_title: row.book_title as string,
    level: row.level as number,
    card_id: row.card_id as string | null,
    partial_input: row.partial_input ? JSON.parse(row.partial_input as string) : null,
    input_mode: row.input_mode as Draft['input_mode'],
    is_meaningful: (row.is_meaningful as number) === 1,
    expires_at: row.expires_at as string,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}
