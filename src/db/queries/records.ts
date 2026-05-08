import * as SQLite from 'expo-sqlite';
import type { ReadingRecord } from '../../types/db.types';

export async function insertRecord(db: SQLite.SQLiteDatabase, record: ReadingRecord) {
  await db.runAsync(
    `INSERT INTO reading_records
      (record_id, child_id, book_title, author, read_date, level, card_id,
       sentences, selected_hints, sync_status, badges, session_index, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      record.record_id,
      record.child_id,
      record.book_title,
      record.author ?? null,
      record.read_date,
      record.level,
      record.card_id,
      JSON.stringify(record.sentences),
      JSON.stringify(record.selected_hints),
      record.sync_status,
      JSON.stringify(record.badges),
      record.session_index,
      record.created_at,
      record.updated_at,
    ]
  );
}

export async function getRecordsByChild(db: SQLite.SQLiteDatabase, childId: string): Promise<ReadingRecord[]> {
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM reading_records WHERE child_id = ? ORDER BY created_at DESC',
    [childId]
  );
  return rows.map(deserializeRecord);
}

export async function getPendingRecords(db: SQLite.SQLiteDatabase): Promise<ReadingRecord[]> {
  const rows = await db.getAllAsync<Record<string, unknown>>(
    "SELECT * FROM reading_records WHERE sync_status = 'pending'"
  );
  return rows.map(deserializeRecord);
}

export async function updateSyncStatus(
  db: SQLite.SQLiteDatabase,
  recordId: string,
  status: 'local' | 'synced' | 'pending'
) {
  await db.runAsync(
    "UPDATE reading_records SET sync_status = ?, updated_at = ? WHERE record_id = ?",
    [status, new Date().toISOString(), recordId]
  );
}

export async function getRecordsByBook(
  db: SQLite.SQLiteDatabase,
  childId: string,
  bookTitle: string
): Promise<ReadingRecord[]> {
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM reading_records WHERE child_id = ? AND book_title = ? ORDER BY created_at DESC',
    [childId, bookTitle]
  );
  return rows.map(deserializeRecord);
}

export function deserializeRecord(row: Record<string, unknown>): ReadingRecord {
  return {
    record_id: row.record_id as string,
    child_id: row.child_id as string,
    book_title: row.book_title as string,
    author: row.author as string | null,
    read_date: row.read_date as string,
    level: row.level as number,
    card_id: row.card_id as string,
    sentences: JSON.parse(row.sentences as string) as string[],
    selected_hints: JSON.parse((row.selected_hints as string) ?? '[]') as string[],
    sync_status: row.sync_status as ReadingRecord['sync_status'],
    badges: JSON.parse((row.badges as string) ?? '[]') as string[],
    session_index: row.session_index as number,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}
