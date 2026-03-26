import { useState, useMemo, useRef } from 'react'
import type { ChartData } from '@/stores/chartStore'

const ZODIAC_SIGNS = [
  { name: '양자리',    symbol: '♈\uFE0E', colorClass: 'text-red-300'    },
  { name: '황소자리',  symbol: '♉\uFE0E', colorClass: 'text-pink-200'   },
  { name: '쌍둥이자리',symbol: '♊\uFE0E', colorClass: 'text-sky-100'    },
  { name: '게자리',    symbol: '♋\uFE0E', colorClass: 'text-gray-300'   },
  { name: '사자자리',  symbol: '♌\uFE0E', colorClass: 'text-yellow-200' },
  { name: '처녀자리',  symbol: '♍\uFE0E', colorClass: 'text-green-200'  },
  { name: '천칭자리',  symbol: '♎\uFE0E', colorClass: 'text-pink-200'   },
  { name: '전갈자리',  symbol: '♏\uFE0E', colorClass: 'text-rose-300'   },
  { name: '사수자리',  symbol: '♐\uFE0E', colorClass: 'text-purple-100' },
  { name: '염소자리',  symbol: '♑\uFE0E', colorClass: 'text-stone-400'  },
  { name: '물병자리',  symbol: '♒\uFE0E', colorClass: 'text-cyan-200'   },
  { name: '물고기자리',symbol: '♓\uFE0E', colorClass: 'text-indigo-200' },
]

const PLANET_SYMBOLS: Record<string, { symbol: string; colorClass: string }> = {
  '태양':   { symbol: '☉', colorClass: 'text-amber-400'  },
  '달':     { symbol: '☾', colorClass: 'text-gray-100'   },
  '수성':   { symbol: '☿', colorClass: 'text-sky-300'    },
  '금성':   { symbol: '♀', colorClass: 'text-pink-400'   },
  '화성':   { symbol: '♂', colorClass: 'text-red-500'    },
  '목성':   { symbol: '♃', colorClass: 'text-purple-300' },
  '토성':   { symbol: '♄', colorClass: 'text-stone-300'  },
  '천왕성': { symbol: '♅', colorClass: 'text-cyan-400'   },
  '해왕성': { symbol: '♆', colorClass: 'text-indigo-400' },
  '명왕성': { symbol: '♇', colorClass: 'text-rose-500'   },
}

const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII']

const R_INNER  = 17
const R_MIDDLE = 28
const R_OUTER  = 40
const R_EDGE   = 49   // 차트 원 반지름
const R_CENTER = 14   // 중앙 원 반지름
const SECTOR   = 30

type PlanetEntry = { symbol: string; name: string; colorClass: string }
type HouseData = {
  houseNum: string
  house: string
  sign: string
  zodiac: string
  sColorClass: string
  planets: PlanetEntry[]
}

function buildAstrologyData(chart: ChartData): HouseData[] {
  const ascIdx = Math.max(0, ZODIAC_SIGNS.findIndex(z => z.name === chart.ascendant.sign))
  const planetsByHouse: Record<number, PlanetEntry[]> = {}
  for (const [name, pos] of Object.entries(chart.planets)) {
    const info = PLANET_SYMBOLS[name]
    if (!info) continue
    if (!planetsByHouse[pos.house]) planetsByHouse[pos.house] = []
    planetsByHouse[pos.house].push({ symbol: info.symbol, name, colorClass: info.colorClass })
  }
  return Array.from({ length: 12 }, (_, i) => {
    const z = ZODIAC_SIGNS[(ascIdx + i) % 12]
    return {
      houseNum: ROMAN[i],
      house: `${i + 1}하우스`,
      sign: z.name,
      zodiac: z.symbol,
      sColorClass: z.colorClass,
      planets: planetsByHouse[i + 1] || [],
    }
  })
}

/** 파이 섹터 SVG path 생성 (cx,cy 중심, r1 내부반지름, r2 외부반지름) */
function sectorPath(cx: number, cy: number, r1: number, r2: number, a1Deg: number, a2Deg: number): string {
  const rad = (d: number) => (d * Math.PI) / 180
  const a1 = rad(a1Deg), a2 = rad(a2Deg)
  return [
    `M ${cx + r1 * Math.cos(a1)} ${cy + r1 * Math.sin(a1)}`,
    `A ${r1} ${r1} 0 0 1 ${cx + r1 * Math.cos(a2)} ${cy + r1 * Math.sin(a2)}`,
    `L ${cx + r2 * Math.cos(a2)} ${cy + r2 * Math.sin(a2)}`,
    `A ${r2} ${r2} 0 0 0 ${cx + r2 * Math.cos(a1)} ${cy + r2 * Math.sin(a1)}`,
    'Z',
  ].join(' ')
}

export default function NightSky({ chart }: { chart: ChartData }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [isPressing, setIsPressing] = useState(false)
  const interactiveSvgRef = useRef<SVGSVGElement>(null)

  const astrologyData = useMemo(() => buildAstrologyData(chart), [chart])

  /** 터치 좌표 → 섹터 인덱스 (범위 밖이면 null) */
  const getSectorIdx = (clientX: number, clientY: number): number | null => {
    const el = interactiveSvgRef.current
    if (!el) return null
    const rect = el.getBoundingClientRect()
    const x = ((clientX - rect.left) / rect.width) * 100 - 50
    const y = ((clientY - rect.top) / rect.height) * 100 - 50
    const dist = Math.sqrt(x * x + y * y)
    if (dist < R_CENTER || dist > R_EDGE) return null
    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90
    if (angle < 0) angle += 360
    return Math.floor(angle / SECTOR) % 12
  }

  const bgStars = useMemo(() => {
    const rand = (n: number) => { const x = Math.sin(n * 127.1 + 42) * 43758.5453; return x - Math.floor(x) }
    return Array.from({ length: 90 }, (_, i) => ({
      cx: rand(i * 2) * 100,
      cy: rand(i * 2 + 1) * 100,
      r:  rand(i * 3) * 0.8 + 0.3,
      opacity: rand(i * 5) * 0.25 + 0.05,
    }))
  }, [])

  const activeItem = activeIndex !== null ? astrologyData[activeIndex] : null

  const dataPointStyle = (idx: number, r: number): React.CSSProperties => {
    const angleRad = ((idx * SECTOR) - 90) * (Math.PI / 180)
    const isActive = activeIndex === idx
    const isDimmed = activeIndex !== null && !isActive
    return {
      position: 'absolute',
      left: `${50 + r * Math.cos(angleRad)}%`,
      top:  `${50 + r * Math.sin(angleRad)}%`,
      transform: isActive
        ? 'translate(-50%,-50%) scale(1.15)'
        : 'translate(-50%,-50%) scale(1)',
      opacity: isDimmed ? 0.25 : 1,
      transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textShadow: '0 2px 6px rgba(0,0,0,0.95)',
      zIndex: 30,
    }
  }

  return (
    <>
    <div className="relative w-full" style={{ aspectRatio: '1 / 1' }}>

      {/* ── 배경 SVG (별, 링, 구분선) ── */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 10, pointerEvents: 'none' }}
      >
        <defs>
          <radialGradient id="nc-bg">
            <stop offset="0%"   stopColor="#171735" />
            <stop offset="60%"  stopColor="#0e0e28" />
            <stop offset="100%" stopColor="#020205" />
          </radialGradient>
          <clipPath id="nc-clip">
            <circle cx="50" cy="50" r={R_EDGE} />
          </clipPath>
        </defs>

        <circle cx="50" cy="50" r={R_EDGE} fill="url(#nc-bg)" stroke="rgba(197,160,40,0.25)" strokeWidth="0.4" />

        <g clipPath="url(#nc-clip)">
          {bgStars.map((s, i) => (
            <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={`rgba(255,255,255,${s.opacity})`} />
          ))}
        </g>

        {/* 링 */}
        <circle cx="50" cy="50" r={R_CENTER}      fill="none" stroke="#D4AF37" strokeWidth="0.06" opacity="0.5" />
        <circle cx="50" cy="50" r={R_INNER}        fill="none" stroke="#D4AF37" strokeWidth="0.08" strokeDasharray="0.2 0.6" opacity="0.5" className="nc-spin-reverse" />
        <circle cx="50" cy="50" r={R_MIDDLE}       fill="none" stroke="#D4AF37" strokeWidth="0.1"  strokeDasharray="0.3 0.8" opacity="0.6" className="nc-spin" />
        <circle cx="50" cy="50" r={R_MIDDLE + 0.5} fill="none" stroke="#D4AF37" strokeWidth="0.04" opacity="0.3" />
        <circle cx="50" cy="50" r={R_OUTER}        fill="none" stroke="#D4AF37" strokeWidth="0.15" opacity="0.5" />
        <circle cx="50" cy="50" r={R_OUTER + 2}    fill="none" stroke="#FDE68A" strokeWidth="0.06" strokeDasharray="0.2 1" opacity="0.7" className="nc-spin-reverse" />

        {/* 구분선 */}
        {astrologyData.map((_, idx) => {
          const divAngle = (idx * SECTOR) - 90 - SECTOR / 2
          const isNearActive = activeIndex !== null && (activeIndex === idx || activeIndex === (idx - 1 + 12) % 12)
          return (
            <g key={idx} transform={`translate(50,50) rotate(${divAngle})`}>
              <line
                x1={R_CENTER} y1="0" x2={R_EDGE} y2="0"
                stroke="#D4AF37"
                strokeWidth={isNearActive ? '0.25' : '0.12'}
                opacity={isNearActive ? 0.9 : 0.55}
                style={{ transition: 'all 0.3s ease' }}
              />
              <polygon points="20,-0.4 20.5,0 20,0.4 19.5,0"     fill="#D4AF37" opacity="0.8" />
              <polygon points="25.5,-0.5 26.2,0 25.5,0.5 24.8,0" fill="#D4AF37" opacity="0.9" />
              <circle cx="33" cy="0" r="0.3" fill="#FDE68A" opacity="0.8" />
              <polygon points="44,-0.5 45,0 44,0.5 43,0"         fill="#FDE68A" opacity="0.9" />
            </g>
          )
        })}
      </svg>

      {/* ── 인터랙티브 섹터 SVG (hover 영역 + 하이라이트) ── */}
      <svg
        ref={interactiveSvgRef}
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 20, touchAction: 'none' }}
        onPointerDown={(e) => {
          if (e.pointerType === 'mouse') return
          e.preventDefault()
          const idx = getSectorIdx(e.clientX, e.clientY)
          if (idx === null) { setActiveIndex(null); return }
          // 같은 섹터 재탭 → 닫기
          if (!isPressing && activeIndex === idx) { setActiveIndex(null); return }
          setActiveIndex(idx)
          setIsPressing(true)
          e.currentTarget.setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          if (e.pointerType === 'mouse' || !isPressing) return
          const idx = getSectorIdx(e.clientX, e.clientY)
          if (idx !== null && idx !== activeIndex) setActiveIndex(idx)
        }}
        onPointerUp={(e) => {
          if (e.pointerType === 'mouse') return
          setIsPressing(false)
          // activeIndex 유지 (닫지 않음)
        }}
        onPointerCancel={() => setIsPressing(false)}
      >
        <clipPath id="nc-sector-clip">
          <circle cx="50" cy="50" r={R_EDGE} />
        </clipPath>
        <g clipPath="url(#nc-sector-clip)">
          {astrologyData.map((_, idx) => {
            const startAngle = (idx * SECTOR) - 90 - SECTOR / 2
            const endAngle   = startAngle + SECTOR
            const isActive   = activeIndex === idx
            const isDimmed   = activeIndex !== null && !isActive
            return (
              <path
                key={idx}
                d={sectorPath(50, 50, R_CENTER, R_EDGE, startAngle, endAngle)}
                fill={
                  isActive  ? 'rgba(212,175,55,0.10)' :
                  isDimmed  ? 'rgba(0,0,0,0.40)'       :
                  'transparent'
                }
                stroke={isActive ? 'rgba(212,175,55,0.55)' : 'none'}
                strokeWidth="0.3"
                style={{ cursor: 'pointer', transition: 'fill 0.3s ease, stroke 0.3s ease' }}
                onPointerEnter={(e) => { if (e.pointerType === 'mouse') setActiveIndex(idx) }}
                onPointerLeave={(e) => { if (e.pointerType === 'mouse') setActiveIndex(null) }}
              />
            )
          })}
        </g>
      </svg>

      {/* ── 데이터 포인트 HTML 레이어 ── */}
      <div className="absolute inset-0 w-full h-full" style={{ zIndex: 30, pointerEvents: 'none' }}>
        {astrologyData.map((item, idx) => (
          <div key={idx}>
            {/* 하우스 번호 */}
            <div style={{ ...dataPointStyle(idx, R_INNER), fontSize: '0.65rem' }}
              className={activeIndex === null ? 'nc-breathe' : ''}>
              <span style={{ color: '#EAB308', fontFamily: 'serif' }}>{item.houseNum}</span>
            </div>

            {/* 행성 */}
            <div style={{ ...dataPointStyle(idx, R_MIDDLE), fontSize: '1.05rem' }}
              className={activeIndex === null ? 'nc-breathe' : ''}>
              {item.planets.length === 0 ? (
                <span style={{ color: '#9CA3AF', opacity: 0.3 }}>⚬</span>
              ) : (
                <div style={{ display: 'flex', gap: '2px' }}>
                  {item.planets.map(p => (
                    <span key={p.name} className={p.colorClass}>{p.symbol}</span>
                  ))}
                </div>
              )}
            </div>

            {/* 황도 기호 */}
            <div style={{ ...dataPointStyle(idx, R_OUTER), fontSize: '0.9rem' }}
              className={activeIndex === null ? 'nc-breathe' : ''}>
              <span className={item.sColorClass}>{item.zodiac}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── 중앙 디스플레이 ── */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full backdrop-blur-md flex flex-col items-center justify-center text-center"
        style={{
          width: '30%',
          height: '30%',
          zIndex: 40,
          background: activeItem ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.6)',
          border: `1px solid ${activeItem ? 'rgba(212,175,55,0.7)' : 'rgba(212,175,55,0.3)'}`,
          boxShadow: activeItem
            ? '0 0 20px rgba(212,175,55,0.25), inset 0 0 15px rgba(0,0,0,0.5)'
            : '0 0 20px rgba(212,175,55,0.1)',
          transition: 'all 0.3s ease',
          padding: '2%',
          pointerEvents: activeItem ? 'auto' : 'none',
          overflow: 'hidden',
          cursor: activeItem ? 'pointer' : 'default',
        }}
        onClick={() => { if (activeItem) { setActiveIndex(null); setIsPressing(false) } }}
      >
        {activeItem ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px', width: '100%', minHeight: 0, overflow: 'hidden' }}>
            {/* 하우스명 */}
            <span style={{
              color: '#9CA3AF',
              fontSize: 'clamp(11px, 3.2vw, 13px)',
              borderBottom: '1px solid rgba(75,85,99,0.5)',
              paddingBottom: '2px',
              width: '85%',
              textAlign: 'center',
            }}>
              {activeItem.house}
            </span>

            {/* 행성 */}
            {activeItem.planets.length === 0 ? (
              <span style={{ color: '#6B7280', fontSize: 'clamp(11px, 3vw, 13px)' }}>행성 없음</span>
            ) : activeItem.planets.length === 1 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className={activeItem.planets[0].colorClass} style={{ fontSize: 'clamp(17px, 4.8vw, 22px)' }}>
                  {activeItem.planets[0].symbol}
                </span>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 'clamp(11px, 3vw, 13px)' }}>
                  {activeItem.planets[0].name}
                </span>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: '2px', fontSize: `clamp(${13 - activeItem.planets.length}px, ${3.5 - activeItem.planets.length * 0.3}vw, ${18 - activeItem.planets.length}px)` }}>
                  {activeItem.planets.map(p => (
                    <span key={p.name} className={p.colorClass}>{p.symbol}</span>
                  ))}
                </div>
                <div style={{ color: '#e5e7eb', fontWeight: 600, fontSize: 'clamp(8px, 2vw, 10px)', lineHeight: 1.1, textAlign: 'center' }}>
                  {activeItem.planets.map(p => p.name).join(' · ')}
                </div>
              </>
            )}

            {/* 사인 */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              borderTop: '1px solid rgba(75,85,99,0.3)',
              paddingTop: '2px',
              width: '85%',
              justifyContent: 'center',
            }}>
              <span className={activeItem.sColorClass} style={{ fontSize: 'clamp(11px, 3vw, 13px)' }}>
                {activeItem.sign}
              </span>
              <span className={activeItem.sColorClass} style={{ fontSize: 'clamp(13px, 3.5vw, 16px)' }}>
                {activeItem.zodiac}
              </span>
            </div>

            {/* 닫기 유도: 터치 시 × 표시 */}
            <span style={{
              color: 'rgba(156,163,175,0.4)',
              fontSize: 'clamp(7px, 1.8vw, 9px)',
            }}>×</span>
          </div>
        ) : (
          <span style={{ color: '#EAB308', fontSize: 'clamp(14px, 3vw, 20px)', textShadow: '0 0 15px rgba(212,175,55,0.8)' }}>
            ✦
          </span>
        )}
      </div>

    </div>

    <p className="text-center text-xs text-text-muted/50 tracking-widest mt-4">
      터치 후 드래그하거나 영역을 눌러보세요
    </p>
    </>
  )
}
