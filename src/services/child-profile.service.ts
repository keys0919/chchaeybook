import { supabase } from './supabase';

export async function updateChildNickname(childId: string, nickname: string): Promise<void> {
  const { error } = await supabase
    .from('child_profiles')
    .update({ nickname })
    .eq('child_id', childId);
  if (error) throw error;
}

export async function updateChildGrade(childId: string, grade: string): Promise<void> {
  const { error } = await supabase
    .from('child_profiles')
    .update({ grade })
    .eq('child_id', childId);
  if (error) throw error;
}

export async function updateChildLevel(childId: string, level: number): Promise<void> {
  const { error } = await supabase
    .from('child_profiles')
    .update({ current_level: level })
    .eq('child_id', childId);
  if (error) throw error;
}
