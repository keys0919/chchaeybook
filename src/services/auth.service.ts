import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

export async function signInWithGoogle(): Promise<void> {
  const redirectTo = 'booksok://auth/callback';
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (data.url) {
    await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  }
}

export async function signInWithKakao(): Promise<void> {
  const redirectTo = 'booksok://auth/callback';
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (data.url) {
    await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  }
}

export async function signInWithApple(): Promise<void> {
  if (Platform.OS !== 'ios') throw new Error('Apple 로그인은 iOS에서만 지원해요');
  const redirectTo = 'booksok://auth/callback';
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (data.url) {
    await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  }
}

export async function ensureParentProfile(userId: string): Promise<void> {
  const { data } = await supabase
    .from('parent_profiles')
    .select('parent_id')
    .eq('parent_id', userId)
    .single();

  if (!data) {
    await supabase.from('parent_profiles').insert({ parent_id: userId });
  }
}

export async function createChildProfile(
  parentId: string,
  nickname: string,
  grade: string | null,
  level: number
): Promise<string> {
  const { data, error } = await supabase
    .from('child_profiles')
    .insert({
      parent_id: parentId,
      nickname,
      grade,
      current_level: level,
      onboarding_completed: false,
    })
    .select('child_id')
    .single();

  if (error) throw error;
  return data.child_id;
}

export async function completeOnboarding(childId: string): Promise<void> {
  const { error } = await supabase
    .from('child_profiles')
    .update({ onboarding_completed: true })
    .eq('child_id', childId);
  if (error) throw error;
}

export async function getChildProfile(parentId: string) {
  const { data } = await supabase
    .from('child_profiles')
    .select('*')
    .eq('parent_id', parentId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  return data;
}
