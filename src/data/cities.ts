import type { City } from '@/stores/chartStore'

export const KOREAN_CITIES: City[] = [
  { name: '서울', country: '대한민국', lat: 37.5665, lng: 126.978, timezone: 'Asia/Seoul' },
  { name: '부산', country: '대한민국', lat: 35.1796, lng: 129.0756, timezone: 'Asia/Seoul' },
  { name: '인천', country: '대한민국', lat: 37.4563, lng: 126.7052, timezone: 'Asia/Seoul' },
  { name: '대구', country: '대한민국', lat: 35.8714, lng: 128.6014, timezone: 'Asia/Seoul' },
  { name: '대전', country: '대한민국', lat: 36.3504, lng: 127.3845, timezone: 'Asia/Seoul' },
  { name: '광주', country: '대한민국', lat: 35.1595, lng: 126.8526, timezone: 'Asia/Seoul' },
  { name: '울산', country: '대한민국', lat: 35.5384, lng: 129.3114, timezone: 'Asia/Seoul' },
  { name: '수원', country: '대한민국', lat: 37.2636, lng: 127.0286, timezone: 'Asia/Seoul' },
  { name: '성남', country: '대한민국', lat: 37.4201, lng: 127.1265, timezone: 'Asia/Seoul' },
  { name: '고양', country: '대한민국', lat: 37.6584, lng: 126.832, timezone: 'Asia/Seoul' },
  { name: '용인', country: '대한민국', lat: 37.2411, lng: 127.1776, timezone: 'Asia/Seoul' },
  { name: '창원', country: '대한민국', lat: 35.2281, lng: 128.6812, timezone: 'Asia/Seoul' },
  { name: '청주', country: '대한민국', lat: 36.6424, lng: 127.489, timezone: 'Asia/Seoul' },
  { name: '전주', country: '대한민국', lat: 35.8242, lng: 127.148, timezone: 'Asia/Seoul' },
  { name: '천안', country: '대한민국', lat: 36.8151, lng: 127.1139, timezone: 'Asia/Seoul' },
  { name: '제주', country: '대한민국', lat: 33.4996, lng: 126.5312, timezone: 'Asia/Seoul' },
  { name: '포항', country: '대한민국', lat: 36.019, lng: 129.3435, timezone: 'Asia/Seoul' },
  { name: '김해', country: '대한민국', lat: 35.2285, lng: 128.8894, timezone: 'Asia/Seoul' },
  { name: '평택', country: '대한민국', lat: 36.9921, lng: 127.0855, timezone: 'Asia/Seoul' },
  { name: '원주', country: '대한민국', lat: 37.3422, lng: 127.9202, timezone: 'Asia/Seoul' },
  { name: '춘천', country: '대한민국', lat: 37.8813, lng: 127.7299, timezone: 'Asia/Seoul' },
  { name: '목포', country: '대한민국', lat: 34.8118, lng: 126.3922, timezone: 'Asia/Seoul' },
  { name: '여수', country: '대한민국', lat: 34.7604, lng: 127.6622, timezone: 'Asia/Seoul' },
  { name: '순천', country: '대한민국', lat: 34.9506, lng: 127.4872, timezone: 'Asia/Seoul' },
  { name: '안동', country: '대한민국', lat: 36.5684, lng: 128.7295, timezone: 'Asia/Seoul' },
  { name: '경주', country: '대한민국', lat: 35.8562, lng: 129.2249, timezone: 'Asia/Seoul' },
  { name: '강릉', country: '대한민국', lat: 37.7519, lng: 128.8761, timezone: 'Asia/Seoul' },
  { name: '속초', country: '대한민국', lat: 38.207, lng: 128.5918, timezone: 'Asia/Seoul' },
]

// GeoNames API를 사용한 전세계 도시 검색
export async function searchCities(query: string): Promise<City[]> {
  if (!query || query.length < 2) return []

  try {
    const res = await fetch(
      `https://secure.geonames.org/searchJSON?q=${encodeURIComponent(query)}&maxRows=10&featureClass=P&lang=ko&username=byeoljido`
    )
    const data = await res.json()

    return (data.geonames || []).map((g: Record<string, string | number>) => ({
      name: g.name as string,
      country: g.countryName as string,
      lat: Number(g.lat),
      lng: Number(g.lng),
      timezone: (g.timezone as unknown as { timeZoneId: string })?.timeZoneId || 'UTC',
    }))
  } catch {
    return []
  }
}
