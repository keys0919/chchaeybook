-- ======================================================
-- 책쏙 SQLite 로컬 스키마
-- 16_implementation_plan 3-1 기준
-- ======================================================

-- 독서 기록 로컬 미러 (sync_status로 서버 동기화 관리)
CREATE TABLE IF NOT EXISTS reading_records (
  record_id     TEXT PRIMARY KEY,
  child_id      TEXT NOT NULL,
  book_title    TEXT NOT NULL,
  author        TEXT,
  read_date     TEXT NOT NULL,
  level         INTEGER NOT NULL,
  card_id       TEXT NOT NULL,
  sentences     TEXT NOT NULL,     -- JSON array
  selected_hints TEXT,             -- JSON array
  sync_status   TEXT NOT NULL DEFAULT 'local', -- local | synced | pending
  badges        TEXT,              -- JSON array
  session_index INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

-- 미디어 아이템 (로컬 파일 경로 전용. local_path는 서버에 저장하지 않는다)
CREATE TABLE IF NOT EXISTS media_items (
  media_id      TEXT PRIMARY KEY,
  record_id     TEXT NOT NULL,
  child_id      TEXT NOT NULL,
  media_type    TEXT NOT NULL,     -- photo | voice
  local_path    TEXT NOT NULL,     -- expo-file-system 로컬 경로
  local_status  TEXT NOT NULL DEFAULT 'saved', -- saved | deleted
  share_status  TEXT NOT NULL DEFAULT 'local_only',
                                   -- local_only | pending_share | shared | share_failed
  created_at    TEXT NOT NULL,
  deleted_at    TEXT               -- soft delete. 한도 집계는 deleted_at IS NULL 기준
);

-- Meaningful Draft (임시 저장)
CREATE TABLE IF NOT EXISTS drafts (
  draft_id       TEXT PRIMARY KEY,
  child_id       TEXT NOT NULL,
  book_title     TEXT NOT NULL,
  level          INTEGER NOT NULL,
  card_id        TEXT,
  partial_input  TEXT,             -- JSON: { type, text?, voice_path?, photo_path? }
  input_mode     TEXT,             -- text | voice | photo
  is_meaningful  INTEGER NOT NULL DEFAULT 0,  -- 0 | 1 (bool)
  expires_at     TEXT NOT NULL,    -- created_at + 7일
  created_at     TEXT NOT NULL,
  updated_at     TEXT NOT NULL
);

-- 카드 캐시
CREATE TABLE IF NOT EXISTS cards (
  card_id         TEXT PRIMARY KEY,
  level           INTEGER NOT NULL,
  type            TEXT NOT NULL,   -- blank | one_sentence | two_sentence | kit | expanded
  category        TEXT NOT NULL,
  question        TEXT NOT NULL,
  sentence_starter TEXT,
  hints           TEXT,            -- JSON array
  parent_coaching TEXT,
  input_modes     TEXT NOT NULL,   -- JSON array
  is_free         INTEGER NOT NULL DEFAULT 1,
  tags            TEXT             -- JSON array
);

-- 카드 사용 이력 (반복 방지)
CREATE TABLE IF NOT EXISTS card_usage_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id    TEXT NOT NULL,
  card_id     TEXT NOT NULL,
  used_at     TEXT NOT NULL
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_reading_records_child_id ON reading_records(child_id);
CREATE INDEX IF NOT EXISTS idx_reading_records_book_title ON reading_records(child_id, book_title);
CREATE INDEX IF NOT EXISTS idx_reading_records_sync_status ON reading_records(sync_status);
CREATE INDEX IF NOT EXISTS idx_media_items_child_id ON media_items(child_id, deleted_at);
CREATE INDEX IF NOT EXISTS idx_media_items_record_id ON media_items(record_id);
CREATE INDEX IF NOT EXISTS idx_drafts_child_id ON drafts(child_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_card_usage_log_child_id ON card_usage_log(child_id, used_at DESC);
CREATE INDEX IF NOT EXISTS idx_cards_level ON cards(level);
