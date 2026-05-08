import { getDb } from '../db/client';
import { insertRecord, updateSyncStatus, getRecordsByChild, getRecordsByBook as dbGetRecordsByBook } from '../db/queries/records';
import { supabase } from './supabase';
import type { ReadingRecord } from '../types/db.types';

export interface BookshelfEntry {
  book_title: string;
  record_count: number;
  last_read: string;
  total_stamps: number;
}

export interface StampEntry {
  record_id: string;
  book_title: string;
  read_date: string;
  badge: string;
}

export async function createRecord(record: ReadingRecord): Promise<void> {
  const db = await getDb();
  await insertRecord(db, record);
  try {
    const { error } = await supabase.from('reading_records').insert({
      record_id: record.record_id,
      child_id: record.child_id,
      book_title: record.book_title,
      author: record.author,
      read_date: record.read_date,
      level: record.level,
      card_id: record.card_id,
      sentences: record.sentences,
      selected_hints: record.selected_hints.length ? record.selected_hints : null,
      badges: record.badges.length ? record.badges : null,
      session_index: record.session_index,
    });
    if (error) throw error;
    await updateSyncStatus(db, record.record_id, 'synced');
  } catch {
    await updateSyncStatus(db, record.record_id, 'pending');
  }
}

export async function getBookshelf(childId: string): Promise<BookshelfEntry[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    book_title: string;
    record_count: number;
    last_read: string;
    all_badges: string | null;
  }>(
    `SELECT book_title,
            COUNT(*) as record_count,
            MAX(created_at) as last_read,
            GROUP_CONCAT(badges, '|SEP|') as all_badges
     FROM reading_records
     WHERE child_id = ?
     GROUP BY book_title
     ORDER BY last_read DESC`,
    [childId]
  );
  return rows.map((r) => {
    let totalStamps = 0;
    if (r.all_badges) {
      for (const part of r.all_badges.split('|SEP|')) {
        try { totalStamps += (JSON.parse(part) as unknown[]).length; } catch {}
      }
    }
    return { book_title: r.book_title, record_count: r.record_count, last_read: r.last_read, total_stamps: totalStamps };
  });
}

export async function getRecordsByBook(childId: string, bookTitle: string): Promise<ReadingRecord[]> {
  const db = await getDb();
  return dbGetRecordsByBook(db, childId, bookTitle);
}

export async function getAllStamps(childId: string): Promise<StampEntry[]> {
  const db = await getDb();
  const records = await getRecordsByChild(db, childId);
  const stamps: StampEntry[] = [];
  for (const r of records) {
    for (const badge of r.badges) {
      stamps.push({ record_id: r.record_id, book_title: r.book_title, read_date: r.read_date, badge });
    }
  }
  return stamps;
}

export async function getRecentBooks(childId: string, limit = 5): Promise<string[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ book_title: string }>(
    `SELECT DISTINCT book_title FROM reading_records
     WHERE child_id = ?
     ORDER BY created_at DESC
     LIMIT ?`,
    [childId, limit]
  );
  return rows.map((r) => r.book_title);
}
