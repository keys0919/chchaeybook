import { supabase } from './supabase';
import type { ParentPraise } from '../types/db.types';

export async function fetchUnseenPraises(childId: string): Promise<ParentPraise[]> {
  const { data, error } = await supabase
    .from('parent_praises')
    .select('*')
    .eq('child_id', childId)
    .eq('seen_by_child', false)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as ParentPraise[];
}

export async function markAllPraiseSeen(childId: string): Promise<void> {
  await supabase
    .from('parent_praises')
    .update({ seen_by_child: true })
    .eq('child_id', childId)
    .eq('seen_by_child', false);
}
