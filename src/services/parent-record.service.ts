import { supabase } from './supabase';
import type { ParentPraise } from '../types/db.types';

export interface ParentRecord {
  record_id: string;
  book_title: string;
  author: string | null;
  read_date: string;
  level: number;
  card_id: string;
  sentences: string[];
  badges: string[];
  parent_praise_id: string | null;
  session_index: number;
  created_at: string;
  parent_coaching?: string | null;
}

export interface ParentBookEntry {
  book_title: string;
  total_records: number;
  unseen_count: number;
  last_read: string;
}

const RECORD_FIELDS =
  'record_id,book_title,author,read_date,level,card_id,sentences,badges,parent_praise_id,session_index,created_at';

export async function getParentBookshelf(childId: string): Promise<ParentBookEntry[]> {
  const { data, error } = await supabase
    .from('reading_records')
    .select('book_title,created_at,parent_praise_id')
    .eq('child_id', childId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  const map = new Map<string, ParentBookEntry>();
  for (const row of data) {
    const entry = map.get(row.book_title);
    if (!entry) {
      map.set(row.book_title, {
        book_title: row.book_title,
        total_records: 1,
        unseen_count: row.parent_praise_id ? 0 : 1,
        last_read: row.created_at,
      });
    } else {
      entry.total_records += 1;
      if (!row.parent_praise_id) entry.unseen_count += 1;
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    if (a.unseen_count > 0 && b.unseen_count === 0) return -1;
    if (a.unseen_count === 0 && b.unseen_count > 0) return 1;
    return new Date(b.last_read).getTime() - new Date(a.last_read).getTime();
  });
}

export async function getParentRecordsByBook(
  childId: string,
  bookTitle: string
): Promise<ParentRecord[]> {
  const { data, error } = await supabase
    .from('reading_records')
    .select(RECORD_FIELDS)
    .eq('child_id', childId)
    .eq('book_title', bookTitle)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return (data as ParentRecord[]).sort((a, b) => {
    if (!a.parent_praise_id && b.parent_praise_id) return -1;
    if (a.parent_praise_id && !b.parent_praise_id) return 1;
    return 0;
  });
}

export async function getAllUnseenRecords(childId: string): Promise<ParentRecord[]> {
  const { data, error } = await supabase
    .from('reading_records')
    .select(RECORD_FIELDS)
    .eq('child_id', childId)
    .is('parent_praise_id', null)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data as ParentRecord[];
}

export async function getParentRecord(recordId: string): Promise<ParentRecord | null> {
  const { data, error } = await supabase
    .from('reading_records')
    .select(RECORD_FIELDS)
    .eq('record_id', recordId)
    .single();

  if (error || !data) return null;

  let parentCoaching: string | null = null;
  const cardId = (data as ParentRecord).card_id;
  if (cardId && !cardId.startsWith('temp')) {
    const { data: card } = await supabase
      .from('cards')
      .select('parent_coaching')
      .eq('card_id', cardId)
      .single();
    parentCoaching = card?.parent_coaching ?? null;
  }

  return { ...(data as ParentRecord), parent_coaching: parentCoaching };
}

export async function sendPraise(
  recordId: string,
  parentId: string,
  childId: string,
  message: string
): Promise<void> {
  const { data, error } = await supabase
    .from('parent_praises')
    .insert({ record_id: recordId, parent_id: parentId, child_id: childId, message })
    .select('praise_id')
    .single();

  if (error) throw error;

  await supabase
    .from('reading_records')
    .update({ parent_praise_id: data.praise_id })
    .eq('record_id', recordId);
}

export async function getPraiseForRecord(recordId: string): Promise<ParentPraise | null> {
  const { data } = await supabase
    .from('parent_praises')
    .select('*')
    .eq('record_id', recordId)
    .single();

  return (data as ParentPraise) ?? null;
}

export interface MonthlyStats {
  booksRead: number;
  sentencesCompleted: number;
}

export async function getMonthlyStats(childId: string): Promise<MonthlyStats> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

  const { data } = await supabase
    .from('reading_records')
    .select('book_title,sentences')
    .eq('child_id', childId)
    .gte('created_at', startDate)
    .lt('created_at', endDate);

  if (!data) return { booksRead: 0, sentencesCompleted: 0 };

  const uniqueBooks = new Set((data as { book_title: string; sentences: string[] }[]).map((r) => r.book_title));
  const sentencesCompleted = (data as { sentences: string[] }[]).reduce(
    (acc, r) => acc + (r.sentences?.length ?? 0),
    0
  );

  return { booksRead: uniqueBooks.size, sentencesCompleted };
}

export async function getWeeklyRecordCount(childId: string): Promise<number> {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from('reading_records')
    .select('record_id', { count: 'exact', head: true })
    .eq('child_id', childId)
    .gte('created_at', startOfWeek.toISOString());

  return count ?? 0;
}

export async function getMonthlyRecordsForAlbum(childId: string): Promise<ParentRecord[]> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

  const { data } = await supabase
    .from('reading_records')
    .select(RECORD_FIELDS)
    .eq('child_id', childId)
    .gte('created_at', startDate)
    .lt('created_at', endDate)
    .order('created_at', { ascending: false });

  return (data as ParentRecord[]) ?? [];
}
