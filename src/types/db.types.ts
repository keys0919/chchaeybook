// PRD 16장 데이터 구조 기준 타입 정의

export type SyncStatus = 'local' | 'synced' | 'pending';
export type MediaType = 'photo' | 'voice';
export type ShareStatus = 'local_only' | 'pending_share' | 'shared' | 'share_failed';

// SQLite ReadingRecord
export interface ReadingRecord {
  record_id: string;
  child_id: string;
  book_title: string;
  author: string | null;
  read_date: string;
  level: number;
  card_id: string;
  sentences: string[];          // JSON array로 저장/복원
  selected_hints: string[];     // JSON array
  sync_status: SyncStatus;
  badges: string[];             // JSON array
  session_index: number;
  created_at: string;
  updated_at: string;
}

// SQLite Draft
export interface Draft {
  draft_id: string;
  child_id: string;
  book_title: string;
  level: number;
  card_id: string | null;
  partial_input: PartialInput | null;
  input_mode: 'text' | 'voice' | 'photo' | null;
  is_meaningful: boolean;
  expires_at: string;           // ISO string
  created_at: string;
  updated_at: string;
}

export interface PartialInput {
  type: 'text' | 'voice' | 'photo';
  text?: string;
  voice_path?: string;
  photo_path?: string;
}

// SQLite MediaItem
export interface MediaItem {
  media_id: string;
  record_id: string;
  child_id: string;
  media_type: MediaType;
  local_path: string;
  local_status: 'saved' | 'deleted';
  share_status: ShareStatus;
  created_at: string;
  deleted_at: string | null;
}

// Supabase 서버 타입
export interface ServerReadingRecord {
  record_id: string;
  child_id: string;
  book_title: string;
  author: string | null;
  read_date: string;
  level: number;
  card_id: string;
  sentences: string[];
  selected_hints: string[] | null;
  badges: string[] | null;
  parent_praise_id: string | null;
  session_index: number;
  created_at: string;
  updated_at: string;
}

export interface ParentPraise {
  praise_id: string;
  record_id: string;
  parent_id: string;
  child_id: string;
  message: string;
  seen_by_child: boolean;
  created_at: string;
}
