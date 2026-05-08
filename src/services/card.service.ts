import { supabase } from './supabase';
import { getDb } from '../db/client';
import type { Card } from '../types/card.types';

function rowToCard(row: Record<string, unknown>): Card {
  return {
    card_id: row.card_id as string,
    level: row.level as 1 | 2 | 3 | 4 | 5,
    type: row.type as Card['type'],
    category: row.category as string,
    question: row.question as string,
    sentence_starter: (row.sentence_starter as string) ?? '',
    hints: JSON.parse((row.hints as string) ?? '[]'),
    parent_coaching: (row.parent_coaching as string) ?? '',
    input_modes: JSON.parse((row.input_modes as string) ?? '["text"]'),
    is_free: Boolean(row.is_free),
    tags: JSON.parse((row.tags as string) ?? '[]'),
  };
}

// Supabase → SQLite 전체 동기화 (앱 시작 시 1회)
export async function syncCardsCache(): Promise<void> {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .order('level', { ascending: true });

  if (error || !data || data.length === 0) return;

  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.execAsync('DELETE FROM cards;');
    for (const card of data) {
      await db.runAsync(
        `INSERT INTO cards
           (card_id, level, type, category, question, sentence_starter,
            hints, parent_coaching, input_modes, is_free, tags)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          card.card_id,
          card.level,
          card.type,
          card.category,
          card.question,
          card.sentence_starter ?? null,
          JSON.stringify(card.hints ?? []),
          card.parent_coaching ?? null,
          JSON.stringify(card.input_modes ?? ['text']),
          card.is_free ? 1 : 0,
          JSON.stringify(card.tags ?? []),
        ]
      );
    }
  });
}

// SQLite 캐시에서 레벨별 카드 목록 조회
export async function getCardsByLevel(level: number): Promise<Card[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM cards WHERE level = ?',
    [level]
  );
  return rows.map(rowToCard);
}

// card_usage_log 기록
export async function logCardUsage(childId: string, cardId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO card_usage_log (child_id, card_id, used_at) VALUES (?, ?, ?)',
    [childId, cardId, new Date().toISOString()]
  );
}

// 최근 N회 사용 카드 ID 목록
export async function getRecentlyUsedCardIds(
  childId: string,
  limit = 5
): Promise<string[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ card_id: string }>(
    `SELECT DISTINCT card_id FROM card_usage_log
     WHERE child_id = ?
     ORDER BY used_at DESC
     LIMIT ?`,
    [childId, limit]
  );
  return rows.map((r) => r.card_id);
}
