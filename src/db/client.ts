import * as SQLite from 'expo-sqlite';

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync('booksok.db');
  await _db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS reading_records (
      record_id     TEXT PRIMARY KEY,
      child_id      TEXT NOT NULL,
      book_title    TEXT NOT NULL,
      author        TEXT,
      read_date     TEXT NOT NULL,
      level         INTEGER NOT NULL,
      card_id       TEXT NOT NULL,
      sentences     TEXT NOT NULL,
      selected_hints TEXT,
      sync_status   TEXT NOT NULL DEFAULT 'local',
      badges        TEXT,
      session_index INTEGER NOT NULL DEFAULT 1,
      created_at    TEXT NOT NULL,
      updated_at    TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS media_items (
      media_id      TEXT PRIMARY KEY,
      record_id     TEXT NOT NULL,
      child_id      TEXT NOT NULL,
      media_type    TEXT NOT NULL,
      local_path    TEXT NOT NULL,
      local_status  TEXT NOT NULL DEFAULT 'saved',
      share_status  TEXT NOT NULL DEFAULT 'local_only',
      created_at    TEXT NOT NULL,
      deleted_at    TEXT
    );

    CREATE TABLE IF NOT EXISTS drafts (
      draft_id       TEXT PRIMARY KEY,
      child_id       TEXT NOT NULL,
      book_title     TEXT NOT NULL,
      level          INTEGER NOT NULL,
      card_id        TEXT,
      partial_input  TEXT,
      input_mode     TEXT,
      is_meaningful  INTEGER NOT NULL DEFAULT 0,
      expires_at     TEXT NOT NULL,
      created_at     TEXT NOT NULL,
      updated_at     TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cards (
      card_id         TEXT PRIMARY KEY,
      level           INTEGER NOT NULL,
      type            TEXT NOT NULL,
      category        TEXT NOT NULL,
      question        TEXT NOT NULL,
      sentence_starter TEXT,
      hints           TEXT,
      parent_coaching TEXT,
      input_modes     TEXT NOT NULL,
      is_free         INTEGER NOT NULL DEFAULT 1,
      tags            TEXT
    );

    CREATE TABLE IF NOT EXISTS card_usage_log (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      child_id    TEXT NOT NULL,
      card_id     TEXT NOT NULL,
      used_at     TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_rr_child ON reading_records(child_id);
    CREATE INDEX IF NOT EXISTS idx_rr_sync ON reading_records(sync_status);
    CREATE INDEX IF NOT EXISTS idx_drafts_child ON drafts(child_id, expires_at);
    CREATE INDEX IF NOT EXISTS idx_cards_level ON cards(level);
    CREATE INDEX IF NOT EXISTS idx_usage_child ON card_usage_log(child_id, used_at);
  `);
  return _db;
}
