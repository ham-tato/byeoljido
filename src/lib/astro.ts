// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import horoscopeLib from 'circular-natal-horoscope-js'
const { Origin, Horoscope } = horoscopeLib
import type { ChartData, PlanetPosition, Aspect } from '@/stores/chartStore'

const SIGN_MAP: Record<string, string> = {
  aries: '양자리',
  taurus: '황소자리',
  gemini: '쌍둥이자리',
  cancer: '게자리',
  leo: '사자자리',
  virgo: '처녀자리',
  libra: '천칭자리',
  scorpio: '전갈자리',
  sagittarius: '사수자리',
  capricorn: '염소자리',
  aquarius: '물병자리',
  pisces: '물고기자리',
}

const PLANET_MAP: Record<string, string> = {
  sun: '태양',
  moon: '달',
  mercury: '수성',
  venus: '금성',
  mars: '화성',
  jupiter: '목성',
  saturn: '토성',
  uranus: '천왕성',
  neptune: '해왕성',
  pluto: '명왕성',
}

const ASPECT_TYPE_MAP: Record<string, Aspect['type']> = {
  conjunction: 'conjunction',
  trine: 'trine',
  sextile: 'sextile',
  square: 'square',
  opposition: 'opposition',
}

function toKoreanSign(sign: string): string {
  return SIGN_MAP[sign.toLowerCase()] || sign
}

export function calculateChart(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  lat: number,
  lng: number,
): ChartData {
  const origin = new Origin({
    year,
    month: month - 1, // 0-indexed
    date: day,
    hour,
    minute,
    second: 0,
    latitude: lat,
    longitude: lng,
  })

  const horoscope = new Horoscope({
    origin,
    houseSystem: 'placidus',
    zodiac: 'tropical',
    aspectPoints: ['bodies', 'points', 'angles'],
    aspectWithPoints: ['bodies', 'points', 'angles'],
    aspectTypes: ['major'],
    customOrbs: {},
    language: 'en',
  })

  // 행성 위치 추출
  const planets: Record<string, PlanetPosition> = {}
  const planetKeys = Object.keys(PLANET_MAP)

  for (const body of horoscope.CelestialBodies.all) {
    const key = body.key?.toLowerCase()
    if (key && planetKeys.includes(key)) {
      planets[PLANET_MAP[key]] = {
        sign: toKoreanSign(body.Sign?.key || ''),
        house: body.House?.id || 1,
        degree: Math.round((body.ChartPosition?.Ecliptic?.DecimalDegrees || 0) * 100) / 100,
      }
    }
  }

  // 상승궁 (ASC)
  const ascSign = horoscope.Ascendant?.Sign?.key || ''
  const ascDegree = horoscope.Ascendant?.ChartPosition?.Ecliptic?.DecimalDegrees || 0

  // MC (중천)
  const mcSign = horoscope.Midheaven?.Sign?.key || ''
  const mcDegree = horoscope.Midheaven?.ChartPosition?.Ecliptic?.DecimalDegrees || 0

  // 노드 (Lunar Nodes)
  let northNodeSign = ''
  let northNodeHouse = 1
  for (const point of horoscope.CelestialPoints?.all || []) {
    if (point.key?.toLowerCase() === 'northnode') {
      northNodeSign = point.Sign?.key || ''
      northNodeHouse = point.House?.id || 1
    }
  }

  // 애스펙트 추출
  const aspects: Aspect[] = []
  for (const aspectGroup of horoscope.Aspects?.all || []) {
    for (const aspect of aspectGroup) {
      const p1Key = aspect.point1?.key?.toLowerCase()
      const p2Key = aspect.point2?.key?.toLowerCase()
      const aspectType = aspect.key?.toLowerCase()

      if (
        p1Key && p2Key && aspectType &&
        PLANET_MAP[p1Key] && PLANET_MAP[p2Key] &&
        ASPECT_TYPE_MAP[aspectType]
      ) {
        aspects.push({
          planet1: PLANET_MAP[p1Key],
          planet2: PLANET_MAP[p2Key],
          type: ASPECT_TYPE_MAP[aspectType],
          orb: Math.round((aspect.orb || 0) * 100) / 100,
        })
      }
    }
  }

  return {
    planets,
    ascendant: { sign: toKoreanSign(ascSign), degree: ascDegree },
    mc: { sign: toKoreanSign(mcSign), degree: mcDegree },
    northNode: { sign: toKoreanSign(northNodeSign), house: northNodeHouse },
    aspects,
  }
}

export { SIGN_MAP, PLANET_MAP }
export const SIGNS = Object.values(SIGN_MAP)
export const PLANETS = Object.values(PLANET_MAP)
