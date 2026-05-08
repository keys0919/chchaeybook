-- ======================================================
-- 책쏙 Supabase Schema
-- 16_implementation_plan 3-2 기준
-- ======================================================

-- 부모 프로필 (Supabase auth.users 연동)
CREATE TABLE parent_profiles (
  parent_id           UUID PRIMARY KEY REFERENCES auth.users,
  subscription_status TEXT NOT NULL DEFAULT 'free',  -- free | paid
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 자녀 프로필
CREATE TABLE child_profiles (
  child_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id            UUID NOT NULL REFERENCES parent_profiles,
  nickname             TEXT NOT NULL,
  grade                TEXT,
  current_level        INTEGER NOT NULL DEFAULT 1,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 독서 기록 서버 사본 (local_path 없음 / media는 media_shares로 분리)
CREATE TABLE reading_records (
  record_id        UUID PRIMARY KEY,
  child_id         UUID NOT NULL REFERENCES child_profiles,
  book_title       TEXT NOT NULL,
  author           TEXT,
  read_date        DATE NOT NULL,
  level            INTEGER NOT NULL,
  card_id          UUID NOT NULL,
  sentences        TEXT[] NOT NULL,
  selected_hints   TEXT[],
  badges           TEXT[],
  parent_praise_id UUID,
  session_index    INTEGER NOT NULL DEFAULT 1,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 미디어 공유 사본 (local_path 없음. storage_path 중심. private bucket)
-- 아이가 [부모님께 보내기] 선택 시에만 레코드 생성
CREATE TABLE media_shares (
  share_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id       TEXT NOT NULL,      -- SQLite media_items.media_id 참조
  record_id      UUID NOT NULL REFERENCES reading_records,
  child_id       UUID NOT NULL REFERENCES child_profiles,
  parent_id      UUID NOT NULL REFERENCES parent_profiles,
  media_type     TEXT NOT NULL,      -- photo | voice
  storage_path   TEXT,               -- Supabase Storage private path
  share_status   TEXT NOT NULL DEFAULT 'pending_share',
                                     -- pending_share | shared | share_failed
  expires_at     TIMESTAMPTZ,        -- 무료: 공유 후 30일. 유료: NULL
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 카드 콘텐츠
CREATE TABLE cards (
  card_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level            INTEGER NOT NULL,
  type             TEXT NOT NULL,    -- blank | one_sentence | two_sentence | kit | expanded
  category         TEXT NOT NULL,
  question         TEXT NOT NULL,
  sentence_starter TEXT,
  hints            TEXT[],
  parent_coaching  TEXT,
  input_modes      TEXT[] NOT NULL,  -- text | voice | photo
  is_free          BOOLEAN NOT NULL DEFAULT true,
  tags             TEXT[]
);

-- 부모 칭찬
CREATE TABLE parent_praises (
  praise_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id      UUID NOT NULL REFERENCES reading_records,
  parent_id      UUID NOT NULL REFERENCES parent_profiles,
  child_id       UUID NOT NULL REFERENCES child_profiles,
  message        TEXT NOT NULL,
  seen_by_child  BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS (Row Level Security) 활성화
ALTER TABLE parent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_praises ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 부모 프로필 (본인만 접근)
CREATE POLICY "parent_profiles_self" ON parent_profiles
  FOR ALL USING (auth.uid() = parent_id);

-- RLS 정책: 자녀 프로필 (부모만 접근)
CREATE POLICY "child_profiles_parent_only" ON child_profiles
  FOR ALL USING (
    parent_id = (SELECT parent_id FROM parent_profiles WHERE parent_id = auth.uid())
  );

-- RLS 정책: 독서 기록 (부모만 접근)
CREATE POLICY "reading_records_parent_only" ON reading_records
  FOR ALL USING (
    child_id IN (SELECT child_id FROM child_profiles WHERE parent_id = auth.uid())
  );

-- RLS 정책: 미디어 공유 (부모만 접근)
CREATE POLICY "media_shares_parent_only" ON media_shares
  FOR ALL USING (parent_id = auth.uid());

-- RLS 정책: 카드 (전체 읽기 허용)
CREATE POLICY "cards_read_all" ON cards
  FOR SELECT USING (true);

-- RLS 정책: 칭찬 (부모 쓰기 / 자녀 읽기는 부모가 대신 조회)
CREATE POLICY "parent_praises_parent" ON parent_praises
  FOR ALL USING (parent_id = auth.uid());

-- 푸시 토큰 (기기당 1개, upsert로 갱신)
CREATE TABLE push_tokens (
  user_id    UUID PRIMARY KEY REFERENCES auth.users,
  token      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "push_tokens_self" ON push_tokens
  FOR ALL USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX idx_child_profiles_parent_id ON child_profiles(parent_id);
CREATE INDEX idx_reading_records_child_id ON reading_records(child_id);
CREATE INDEX idx_reading_records_book_title ON reading_records(child_id, book_title);
CREATE INDEX idx_media_shares_record_id ON media_shares(record_id);
CREATE INDEX idx_parent_praises_child_id ON parent_praises(child_id, seen_by_child);
CREATE INDEX idx_cards_level ON cards(level, is_free);
