import { supabase } from './supabase'

export interface KakaoUser {
  id: string
  nickname: string
  email?: string
  profileImage?: string
}

export function initKakao() { /* Supabase OAuth가 처리함 */ }

export async function kakaoLogin(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo: `${window.location.origin}/input`,
      scopes: '',
    },
  })
  if (error) throw error
}

export async function kakaoLogout(): Promise<void> {
  await supabase.auth.signOut()
}
