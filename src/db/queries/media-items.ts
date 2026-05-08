import * as SQLite from 'expo-sqlite';
import type { MediaItem } from '../../types/db.types';

export async function insertMediaItem(db: SQLite.SQLiteDatabase, item: MediaItem) {
  await db.runAsync(
    `INSERT INTO media_items
      (media_id, record_id, child_id, media_type, local_path, local_status, share_status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      item.media_id,
      item.record_id,
      item.child_id,
      item.media_type,
      item.local_path,
      item.local_status,
      item.share_status,
      item.created_at,
    ]
  );
}

// 한도 집계 쿼리 (deleted_at IS NULL 기준)
export async function getMediaCount(db: SQLite.SQLiteDatabase, childId: string): Promise<number> {
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM media_items WHERE child_id = ? AND deleted_at IS NULL',
    [childId]
  );
  return result?.count ?? 0;
}

export async function updateShareStatus(
  db: SQLite.SQLiteDatabase,
  mediaId: string,
  status: MediaItem['share_status']
) {
  await db.runAsync(
    'UPDATE media_items SET share_status = ? WHERE media_id = ?',
    [status, mediaId]
  );
}

export async function softDeleteMediaItem(db: SQLite.SQLiteDatabase, mediaId: string) {
  const now = new Date().toISOString();
  await db.runAsync(
    "UPDATE media_items SET local_status = 'deleted', deleted_at = ? WHERE media_id = ?",
    [now, mediaId]
  );
}
