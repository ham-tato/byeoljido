import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { KakaoUser } from '@/lib/kakao'
import type { BirthInput, ChartData } from './chartStore'

interface AuthStore {
  user: KakaoUser | null
  setUser: (user: KakaoUser | null) => void
  clearUser: () => void
  saveResult: (input: BirthInput, chart: ChartData) => Promise<void>
  loadSavedResult: () => Promise<{ input: BirthInput; chart: ChartData } | null>
}

function sessionToKakaoUser(user: { id: string; email?: string }): KakaoUser {
  return { id: user.id, nickname: '', email: user.email }
}

export const useAuthStore = create<AuthStore>((set, get) => {
  // 앱 시작 시 기존 세션 복원
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) set({ user: sessionToKakaoUser(session.user) })
  })

  // OAuth 리다이렉트 후 자동으로 유저 세팅
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) set({ user: sessionToKakaoUser(session.user) })
    else set({ user: null })
  })

  return {
    user: null,

    setUser: (user) => set({ user }),

    clearUser: async () => {
      set({ user: null })
    },

    saveResult: async (input, chart) => {
      const { user } = get()
      if (!user) return
      await supabase.from('results').upsert({
        kakao_id: user.id,
        nickname: user.nickname,
        input,
        chart,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'kakao_id' })
    },

    loadSavedResult: async () => {
      const { user } = get()
      if (!user) return null
      const { data, error } = await supabase
        .from('results')
        .select('input, chart')
        .eq('kakao_id', user.id)
        .single()
      if (error || !data) return null
      return { input: data.input as BirthInput, chart: data.chart as ChartData }
    },
  }
})
