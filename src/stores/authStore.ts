import { create } from 'zustand'
import type { KakaoUser } from '@/lib/kakao'
import type { BirthInput, ChartData } from './chartStore'

const STORAGE_KEY = 'byeoljido_user'
const RESULT_KEY = (uid: number) => `byeoljido_saved_${uid}`

function loadUser(): KakaoUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

interface AuthStore {
  user: KakaoUser | null
  setUser: (user: KakaoUser | null) => void
  saveResult: (input: BirthInput, chart: ChartData) => void
  loadSavedResult: () => { input: BirthInput; chart: ChartData } | null
  clearUser: () => void
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: loadUser(),

  setUser: (user) => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else localStorage.removeItem(STORAGE_KEY)
    set({ user })
  },

  saveResult: (input, chart) => {
    const { user } = get()
    if (!user) return
    localStorage.setItem(RESULT_KEY(user.id), JSON.stringify({ input, chart }))
  },

  loadSavedResult: () => {
    const { user } = get()
    if (!user) return null
    try {
      const raw = localStorage.getItem(RESULT_KEY(user.id))
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  },

  clearUser: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({ user: null })
  },
}))
