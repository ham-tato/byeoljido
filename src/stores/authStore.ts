import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { KakaoUser } from '@/lib/kakao'
import type { BirthInput, ChartData } from './chartStore'

const USER_KEY = 'byeoljido_user'

function loadUser(): KakaoUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

interface AuthStore {
  user: KakaoUser | null
  setUser: (user: KakaoUser | null) => void
  clearUser: () => void
  saveResult: (input: BirthInput, chart: ChartData) => Promise<void>
  loadSavedResult: () => Promise<{ input: BirthInput; chart: ChartData } | null>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: loadUser(),

  setUser: (user) => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
    else localStorage.removeItem(USER_KEY)
    set({ user })
  },

  clearUser: () => {
    localStorage.removeItem(USER_KEY)
    set({ user: null })
  },

  // Supabase에 결과 저장 (upsert — 같은 kakao_id면 덮어씀)
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

  // Supabase에서 결과 불러오기
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
}))
