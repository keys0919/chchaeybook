// localStorage 기반 경량 DB — expo-sqlite 대체 (PWA용)
import type { ReadingRecord, Draft } from '../types/db.types';

interface CardUsageEntry {
  child_id: string;
  card_id: string;
  used_at: string;
}

const KEY = {
  records: 'booksok_records',
  drafts: 'booksok_drafts',
  cardLog: 'booksok_card_log',
};

function read<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]') as T[];
  } catch {
    return [];
  }
}

function write<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ── Reading Records ──────────────────────────────────────────────────────────

export function insertRecord(record: ReadingRecord): void {
  const all = read<ReadingRecord>(KEY.records);
  write(KEY.records, [...all, record]);
}

export function getRecordsByChild(childId: string): ReadingRecord[] {
  return read<ReadingRecord>(KEY.records)
    .filter((r) => r.child_id === childId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getRecordsByBook(childId: string, bookTitle: string): ReadingRecord[] {
  return read<ReadingRecord>(KEY.records)
    .filter((r) => r.child_id === childId && r.book_title === bookTitle)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function deleteBookRecords(childId: string, bookTitle: string): void {
  const all = read<ReadingRecord>(KEY.records);
  write(KEY.records, all.filter((r) => !(r.child_id === childId && r.book_title === bookTitle)));
}

// ── Drafts ───────────────────────────────────────────────────────────────────

export function upsertDraft(draft: Draft): void {
  const all = read<Draft>(KEY.drafts);
  const idx = all.findIndex((d) => d.draft_id === draft.draft_id);
  if (idx >= 0) {
    all[idx] = draft;
  } else {
    all.push(draft);
  }
  write(KEY.drafts, all);
}

export function getMeaningfulDrafts(childId: string): Draft[] {
  const now = new Date().toISOString();
  return read<Draft>(KEY.drafts)
    .filter((d) => d.child_id === childId && d.expires_at > now && d.is_meaningful)
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export function deleteDraft(draftId: string): void {
  write(KEY.drafts, read<Draft>(KEY.drafts).filter((d) => d.draft_id !== draftId));
}

export function cleanExpiredDrafts(): void {
  const now = new Date().toISOString();
  write(KEY.drafts, read<Draft>(KEY.drafts).filter((d) => d.expires_at > now));
}

// ── Card Usage Log ───────────────────────────────────────────────────────────

export function logCardUsage(childId: string, cardId: string): void {
  const all = read<CardUsageEntry>(KEY.cardLog);
  const next = [{ child_id: childId, card_id: cardId, used_at: new Date().toISOString() }, ...all];
  write(KEY.cardLog, next.slice(0, 50));
}

export function getRecentlyUsedCardIds(childId: string, limit = 5): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const entry of read<CardUsageEntry>(KEY.cardLog)) {
    if (entry.child_id !== childId) continue;
    if (!seen.has(entry.card_id)) {
      seen.add(entry.card_id);
      result.push(entry.card_id);
    }
    if (result.length >= limit) break;
  }
  return result;
}

// ── Export (JSON 내보내기) ────────────────────────────────────────────────────

export function exportAllData(childId: string): string {
  return JSON.stringify({
    exported_at: new Date().toISOString(),
    records: getRecordsByChild(childId),
    drafts: getMeaningfulDrafts(childId),
  }, null, 2);
}
