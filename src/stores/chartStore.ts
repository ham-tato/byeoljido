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

export const useChartStore = create<ChartStore>((set) => ({
  input: null,
  chart: null,
  setInput: (input) => set({ input }),
  setChart: (chart) => set({ chart }),
  reset: () => set({ input: null, chart: null }),
}))
