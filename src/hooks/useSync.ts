import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { getDb } from '../db/client';
import { getPendingRecords, updateSyncStatus } from '../db/queries/records';
import { supabase } from '../services/supabase';

async function syncPendingRecords(): Promise<void> {
  const db = await getDb();
  const pending = await getPendingRecords(db);
  if (pending.length === 0) return;

  for (const record of pending) {
    try {
      const { error } = await supabase.from('reading_records').upsert({
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
      if (!error) {
        await updateSyncStatus(db, record.record_id, 'synced');
      }
    } catch {}
  }
}

export function useSync() {
  useEffect(() => {
    syncPendingRecords().catch(() => {});

    const handleAppState = (state: AppStateStatus) => {
      if (state === 'active') {
        syncPendingRecords().catch(() => {});
      }
    };
    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, []);
}
