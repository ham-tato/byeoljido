import { useState, useRef, useEffect } from 'react'
import { KOREAN_CITIES, searchCities } from '@/data/cities'
import type { City } from '@/stores/chartStore'

interface Props {
  value: City | null
  onChange: (city: City) => void
}

export default function CitySearch({ value, onChange }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<City[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleQueryChange(q: string) {
    setQuery(q)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    if (q.length < 1) {
      setResults([])
      setIsOpen(false)
      return
    }

    // 한국 도시 즉시 필터 (한 글자부터)
    const koreanMatches = KOREAN_CITIES.filter(c => c.name.includes(q))
    setResults(koreanMatches)
    if (koreanMatches.length > 0) setIsOpen(true)

    // 2글자 이상이면 해외 도시도 검색 (디바운스)
    if (q.length >= 2) {
      timeoutRef.current = setTimeout(async () => {
        setIsSearching(true)
        const apiResults = await searchCities(q)
        // 이름+국가 기준 중복 제거
        const seen = new Set(KOREAN_CITIES.filter(c => c.name.includes(q)).map(c => `${c.name}|${c.country}`))
        const filtered = apiResults.filter(c => {
          const key = `${c.name}|${c.country}`
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })
        const korean = KOREAN_CITIES.filter(c => c.name.includes(q))
        setResults([...korean, ...filtered].slice(0, 15))
        setIsOpen(true)
        setIsSearching(false)
      }, 400)
    }
  }

  function selectCity(city: City) {
    onChange(city)
    setQuery(`${city.name}, ${city.country}`)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm text-text-muted mb-1.5">출생 도시</label>

      {/* 한국 주요 도시 프리셋 */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {KOREAN_CITIES.slice(0, 8).map(city => (
          <button
            key={city.name}
            type="button"
            onClick={() => selectCity(city)}
            className={`px-2.5 py-1 rounded-full text-xs transition-colors cursor-pointer ${
              value?.name === city.name && value?.country === '대한민국'
                ? 'bg-primary text-white'
                : 'bg-bg-card text-text-muted hover:bg-border hover:text-text'
            }`}
          >
            {city.name}
          </button>
        ))}
      </div>

      {/* 검색 입력 */}
      <input
        type="text"
        value={query}
        onChange={e => handleQueryChange(e.target.value)}
        onFocus={() => query.length >= 2 && setIsOpen(true)}
        placeholder="도시명 검색 (예: 파주, Tokyo, New York)"
        className="w-full px-4 py-3 bg-bg-input border border-border rounded-lg text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition-colors"
      />

      {/* 검색 결과 드롭다운 */}
      {isOpen && (results.length > 0 || isSearching) && (
        <div className="absolute z-50 w-full mt-1 border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto" style={{ background: '#1a1a2e' }}>
          {results.map((city, i) => (
            <button
              key={`${city.name}-${city.lat}-${i}`}
              type="button"
              onClick={() => selectCity(city)}
              className="w-full px-4 py-2.5 text-left hover:bg-bg-input transition-colors text-sm cursor-pointer"
            >
              <span className="text-text">{city.name}</span>
              <span className="text-text-muted ml-2">{city.country}</span>
            </button>
          ))}
          {isSearching && (
            <div className="px-4 py-2.5 text-text-muted text-sm">검색 중...</div>
          )}
        </div>
      )}

      {value && (
        <p className="text-xs text-text-muted mt-1">
          선택: {value.name}, {value.country} ({value.lat.toFixed(2)}, {value.lng.toFixed(2)})
        </p>
      )}
    </div>
  )
}
