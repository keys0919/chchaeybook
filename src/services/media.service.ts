import { File, Directory, Paths } from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import { supabase } from './supabase';
import { getDb } from '../db/client';
import { insertMediaItem, updateShareStatus } from '../db/queries/media-items';
import type { MediaItem } from '../types/db.types';

function getMediaDir(): Directory {
  return new Directory(Paths.document, 'media');
}

function ensureMediaDir(): void {
  const dir = getMediaDir();
  if (!dir.exists) {
    dir.create({ intermediates: true, idempotent: true });
  }
}

export async function savePhotoLocally(
  uri: string,
  childId: string,
  recordId: string
): Promise<MediaItem> {
  ensureMediaDir();
  const mediaId = Crypto.randomUUID();
  const ext = uri.split('.').pop()?.split('?')[0] ?? 'jpg';
  const destFile = new File(getMediaDir(), `${mediaId}.${ext}`);
  new File(uri).copy(destFile);

  const item: MediaItem = {
    media_id: mediaId,
    record_id: recordId,
    child_id: childId,
    media_type: 'photo',
    local_path: destFile.uri,
    local_status: 'saved',
    share_status: 'local_only',
    created_at: new Date().toISOString(),
    deleted_at: null,
  };

  const db = await getDb();
  await insertMediaItem(db, item);
  return item;
}

export async function saveVoiceLocally(
  uri: string,
  childId: string,
  recordId: string
): Promise<MediaItem> {
  ensureMediaDir();
  const mediaId = Crypto.randomUUID();
  const destFile = new File(getMediaDir(), `${mediaId}.m4a`);
  new File(uri).copy(destFile);

  const item: MediaItem = {
    media_id: mediaId,
    record_id: recordId,
    child_id: childId,
    media_type: 'voice',
    local_path: destFile.uri,
    local_status: 'saved',
    share_status: 'local_only',
    created_at: new Date().toISOString(),
    deleted_at: null,
  };

  const db = await getDb();
  await insertMediaItem(db, item);
  return item;
}

export async function shareMediaToParent(
  mediaId: string,
  localPath: string,
  mediaType: 'photo' | 'voice',
  recordId: string,
  childId: string,
  parentId: string
): Promise<void> {
  const db = await getDb();
  await updateShareStatus(db, mediaId, 'pending_share');

  const ext = mediaType === 'voice' ? 'm4a' : (localPath.split('.').pop() ?? 'jpg');
  const storagePath = `${childId}/${recordId}/${mediaId}.${ext}`;

  const bytes = await new File(localPath).bytes();
  const mimeType = mediaType === 'voice' ? 'audio/m4a' : 'image/jpeg';

  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(storagePath, bytes, { contentType: mimeType, upsert: false });

  if (uploadError) {
    await updateShareStatus(db, mediaId, 'share_failed');
    throw uploadError;
  }

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const { error: insertError } = await supabase.from('media_shares').insert({
    media_id: mediaId,
    record_id: recordId,
    child_id: childId,
    parent_id: parentId,
    media_type: mediaType,
    storage_path: storagePath,
    share_status: 'shared',
    expires_at: expiresAt,
  });

  if (insertError) {
    await updateShareStatus(db, mediaId, 'share_failed');
    throw insertError;
  }

  await updateShareStatus(db, mediaId, 'shared');
}

export async function getSignedUrl(storagePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('media')
    .createSignedUrl(storagePath, 3600);
  if (error || !data) return null;
  return data.signedUrl;
}

export async function getMediaSharesForRecord(recordId: string) {
  const { data } = await supabase
    .from('media_shares')
    .select('*')
    .eq('record_id', recordId)
    .neq('share_status', 'share_failed');
  return data ?? [];
}
