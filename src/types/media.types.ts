// 미디어 타입 (16_implementation_plan 미디어 정책 기준)

export type MediaType = 'photo' | 'voice';
export type ShareStatus = 'local_only' | 'pending_share' | 'shared' | 'share_failed';

export interface MediaItemLocal {
  media_id: string;
  record_id: string;
  child_id: string;
  media_type: MediaType;
  local_path: string;           // expo-file-system 로컬 경로 (서버에 저장 안 함)
  local_status: 'saved' | 'deleted';
  share_status: ShareStatus;
  created_at: string;
  deleted_at: string | null;
}

export interface MediaShare {
  share_id: string;
  media_id: string;             // SQLite media_items.media_id 참조
  record_id: string;
  child_id: string;
  parent_id: string;
  media_type: MediaType;
  storage_path: string | null;  // Supabase Storage private path (public URL 아님)
  share_status: Exclude<ShareStatus, 'local_only'>;
  expires_at: string | null;
  created_at: string;
}

// 미디어 한도 (useMediaQuota)
export interface MediaQuota {
  count: number;
  isNearLimit: boolean;   // 15개↑
  isAtLimit: boolean;     // 30개
}

export const MEDIA_QUOTA = {
  WARNING_THRESHOLD: 15,
  HARD_LIMIT: 30,
} as const;
