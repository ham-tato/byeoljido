import { create } from 'zustand'

export interface City {
  name: string
  country: string
  lat: number
  lng: number
  timezone: string
}

export interface BirthInput {
  nickname: string
  year: number
  month: number
  day: number
  hour: number
  minute: number
  city: City
}

export interface PlanetPosition {
  sign: string
  house: number
  degree: number
}

export interface Aspect {
  planet1: string
  planet2: string
  type: 'conjunction' | 'trine' | 'sextile' | 'square' | 'opposition'
  orb: number
}

export interface ChartData {
  planets: Record<string, PlanetPosition>
  ascendant: { sign: string; degree: number }
  mc: { sign: string; degree: number }
  northNode: { sign: string; house: number }
  aspects: Aspect[]
}

interface ChartStore {
  input: BirthInput | null
  chart: ChartData | null
  setInput: (input: BirthInput) => void
  setChart: (chart: ChartData) => void
  reset: () => void
}

function loadFromStorage<T>(key: string): T | null {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

function saveToStorage(key: string, value: unknown) {
  try {
    if (value === null) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, JSON.stringify(value))
    }
  } catch { /* ignore */ }
}

export const useChartStore = create<ChartStore>((set) => ({
  input: loadFromStorage<BirthInput>('byeoljido_input'),
  chart: loadFromStorage<ChartData>('byeoljido_chart'),
  setInput: (input) => {
    saveToStorage('byeoljido_input', input)
    set({ input })
  },
  setChart: (chart) => {
    saveToStorage('byeoljido_chart', chart)
    set({ chart })
  },
  reset: () => {
    saveToStorage('byeoljido_input', null)
    saveToStorage('byeoljido_chart', null)
    set({ input: null, chart: null })
  },
}))
