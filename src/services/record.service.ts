// 기록 서비스 — localStorage 기반 (Supabase 제거)
import {
  insertRecord,
  getRecordsByChild,
  getRecordsByBook as dbGetByBook,
} from '../db/index';
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
  insertRecord(record);
}

export async function getBookshelf(childId: string): Promise<BookshelfEntry[]> {
  const records = getRecordsByChild(childId);
  const map = new Map<string, BookshelfEntry>();
  for (const r of records) {
    const entry = map.get(r.book_title);
    if (entry) {
      entry.record_count += 1;
      entry.total_stamps += r.badges.length;
      if (r.created_at > entry.last_read) entry.last_read = r.created_at;
    } else {
      map.set(r.book_title, {
        book_title: r.book_title,
        record_count: 1,
        last_read: r.created_at,
        total_stamps: r.badges.length,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.last_read.localeCompare(a.last_read));
}

export async function getRecordsByBook(
  childId: string,
  bookTitle: string
): Promise<ReadingRecord[]> {
  return dbGetByBook(childId, bookTitle);
}

export async function getAllStamps(childId: string): Promise<StampEntry[]> {
  const records = getRecordsByChild(childId);
  const stamps: StampEntry[] = [];
  for (const r of records) {
    for (const badge of r.badges) {
      stamps.push({
        record_id: r.record_id,
        book_title: r.book_title,
        read_date: r.read_date,
        badge,
      });
    }
  }
  return stamps;
}

export async function getChildWeeklyCount(childId: string): Promise<number> {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return getRecordsByChild(childId).filter(
    (r) => r.created_at >= startOfWeek.toISOString()
  ).length;
}

export async function getChildLevelCount(childId: string, level: number): Promise<number> {
  return getRecordsByChild(childId).filter((r) => r.level === level).length;
}

export async function getRecentBooks(childId: string, limit = 5): Promise<string[]> {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const r of getRecordsByChild(childId)) {
    if (!seen.has(r.book_title)) {
      seen.add(r.book_title);
      result.push(r.book_title);
    }
    if (result.length >= limit) break;
  }
  return result;
}
