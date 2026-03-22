import { useState, useMemo } from 'react'
import type { ChartData, Aspect } from '@/stores/chartStore'

const PLANET_INFO: Record<string, { label: string; color: string; size: number; summary: Record<string, string> }> = {
  '태양': {
    label: '태양', color: '#FCD34D', size: 22,
    summary: { '양자리': '용기와 열정의 자아', '황소자리': '우직하고 감각적인 자아', '쌍둥이자리': '재치 넘치는 소통의 자아', '게자리': '깊은 공감의 자아', '사자자리': '당당한 리더의 자아', '처녀자리': '꼼꼼한 완벽주의 자아', '천칭자리': '조화를 추구하는 자아', '전갈자리': '강렬한 통찰의 자아', '사수자리': '자유로운 탐험가의 자아', '염소자리': '묵묵한 야심가의 자아', '물병자리': '독창적 혁신가의 자아', '물고기자리': '무한한 감수성의 자아' },
  },
  '달': {
    label: '달', color: '#CBD5E1', size: 18,
    summary: { '양자리': '불꽃처럼 뜨거운 감정', '황소자리': '안정을 갈망하는 내면', '쌍둥이자리': '쉴 새 없이 돌아가는 내면', '게자리': '누구보다 여린 감수성', '사자자리': '사랑받고 싶은 내면', '처녀자리': '감정도 분석하는 내면', '천칭자리': '조화를 갈망하는 내면', '전갈자리': '용암처럼 뜨거운 속마음', '사수자리': '자유를 갈망하는 내면', '염소자리': '무거운 책임감의 내면', '물병자리': '독립적 관찰자의 내면', '물고기자리': '경계 없는 깊은 감수성' },
  },
  '수성': {
    label: '수성', color: '#67E8F9', size: 10,
    summary: { '양자리': '직선적인 팩트 폭격기', '황소자리': '신중하고 묵직한 화법', '쌍둥이자리': '멀티태스킹 스토리텔러', '게자리': '감정으로 소통하는 공감러', '사자자리': '드라마틱한 표현력', '처녀자리': '핵심만 짚는 분석가', '천칭자리': '균형 잡힌 소통의 달인', '전갈자리': '숨은 의도를 꿰뚫는 눈', '사수자리': '큰 그림을 그리는 비전가', '염소자리': '결론부터 말하는 실용주의', '물병자리': '틀을 깨는 창의적 사고', '물고기자리': '감성적 은유의 달인' },
  },
  '금성': {
    label: '금성', color: '#F9A8D4', size: 12,
    summary: { '양자리': '거침없이 직진하는 사랑', '황소자리': '편안하고 지조 있는 사랑', '쌍둥이자리': '대화가 통해야 하는 사랑', '게자리': '헌신적으로 보살피는 사랑', '사자자리': '로맨스와 드라마의 사랑', '처녀자리': '세심한 배려로 증명하는 사랑', '천칭자리': '균형 잡힌 파트너십의 사랑', '전갈자리': '영혼까지 올인하는 사랑', '사수자리': '자유로운 모험형 사랑', '염소자리': '미래가 보이는 진지한 사랑', '물병자리': '독립성을 존중하는 사랑', '물고기자리': '경계 없이 빠져드는 사랑' },
  },
  '화성': {
    label: '화성', color: '#FCA5A5', size: 11,
    summary: { '양자리': '즉각 행동하는 추진력', '황소자리': '느리지만 멈추지 않는 힘', '쌍둥이자리': '말로 승부하는 에너지', '게자리': '소중한 것을 지키는 힘', '사자자리': '주목받을 때 타오르는 열정', '처녀자리': '완벽을 향한 집요한 힘', '천칭자리': '갈등을 조율하는 에너지', '전갈자리': '한번 물면 놓지 않는 집중력', '사수자리': '모험을 향한 거침없는 돌진', '염소자리': '단계적으로 올라가는 야망', '물병자리': '혁신을 향한 반골 에너지', '물고기자리': '직관을 따르는 부드러운 힘' },
  },
  '목성': {
    label: '목성', color: '#C4B5FD', size: 14,
    summary: { '양자리': '도전에서 행운을 만나는', '황소자리': '꾸준함이 폭발하는 행운', '쌍둥이자리': '호기심이 기회가 되는 행운', '게자리': '돌봄이 돌아오는 행운', '사자자리': '표현할 때 터지는 행운', '처녀자리': '디테일에서 기회를 찾는 행운', '천칭자리': '협업에서 시너지가 나는 행운', '전갈자리': '깊이 파고들 때 오는 행운', '사수자리': '세상을 넓힐수록 커지는 행운', '염소자리': '시간이 보상하는 행운', '물병자리': '틀을 깰 때 바뀌는 운명', '물고기자리': '직감을 따를 때 오는 행운' },
  },
  '토성': {
    label: '토성', color: '#A8A29E', size: 13,
    summary: { '양자리': '인내를 배우는 시련', '황소자리': '물질적 안정의 시련', '쌍둥이자리': '집중력의 시련', '게자리': '감정 독립의 시련', '사자자리': '겸손을 배우는 시련', '처녀자리': '완벽주의의 시련', '천칭자리': '관계의 균형 시련', '전갈자리': '통제를 내려놓는 시련', '사수자리': '현실 감각의 시련', '염소자리': '책임감과 야망의 시련', '물병자리': '자유와 규칙의 시련', '물고기자리': '경계를 세우는 시련' },
  },
}

function getAspectColor(type: Aspect['type']): string {
  if (type === 'trine' || type === 'sextile') return 'rgba(212, 175, 55, 0.3)'
  if (type === 'square' || type === 'opposition') return 'rgba(239, 68, 68, 0.25)'
  return 'rgba(180, 180, 180, 0.2)'
}

interface PlanetNode {
  name: string
  x: number
  y: number
  color: string
  size: number
  tooltip: string
}

export default function NightSky({ chart }: { chart: ChartData }) {
  const [active, setActive] = useState<string | null>(null)

  const SIZE = 340
  const R = SIZE / 2 - 30

  // 행성 위치 계산
  const planets = useMemo<PlanetNode[]>(() => {
    const cx = SIZE / 2
    const cy = SIZE / 2
    const nodes: PlanetNode[] = []

    for (const [name, pos] of Object.entries(chart.planets)) {
      const info = PLANET_INFO[name]
      if (!info) continue
      const angle = ((270 - pos.degree) * Math.PI) / 180
      const orbitR = R * (0.55 + (info.size / 22) * 0.25) // 큰 행성은 바깥, 작은 건 안쪽
      nodes.push({
        name,
        x: cx + Math.cos(angle) * orbitR,
        y: cy - Math.sin(angle) * orbitR,
        color: info.color,
        size: info.size,
        tooltip: `${info.label} — ${pos.sign} ${pos.house}하우스: ${info.summary[pos.sign] || ''}`,
      })
    }
    return nodes
  }, [chart])

  // 애스펙트 선 (주요 행성만)
  const aspectLines = useMemo(() => {
    const knownPlanets = new Set(Object.keys(PLANET_INFO))
    return chart.aspects.filter(a =>
      knownPlanets.has(a.planet1) && knownPlanets.has(a.planet2) && a.orb < 6
    )
  }, [chart])

  const planetMap = useMemo(() => {
    const m: Record<string, PlanetNode> = {}
    for (const p of planets) m[p.name] = p
    return m
  }, [planets])

  // 배경 별 (고정)
  const bgStars = useMemo(() => {
    const stars: { x: number; y: number; r: number; o: number }[] = []
    for (let i = 0; i < 120; i++) {
      const rand = (n: number) => { const x = Math.sin(n * 127.1 + 42) * 43758.5453; return x - Math.floor(x) }
      stars.push({
        x: rand(i * 2) * SIZE,
        y: rand(i * 2 + 1) * SIZE,
        r: rand(i * 3) * 0.8 + 0.3,
        o: rand(i * 5) * 0.25 + 0.05,
      })
    }
    return stars
  }, [])

  const activeNode = active ? planetMap[active] : null

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        {/* SVG 밤하늘 */}
        <svg width={SIZE} height={SIZE} className="absolute inset-0">
          <defs>
            <radialGradient id="skyBg">
              <stop offset="0%" stopColor="#171735" />
              <stop offset="60%" stopColor="#0e0e28" />
              <stop offset="100%" stopColor="#070712" />
            </radialGradient>
            <clipPath id="skyClip">
              <circle cx={SIZE / 2} cy={SIZE / 2} r={SIZE / 2 - 2} />
            </clipPath>
          </defs>

          {/* 배경 원 */}
          <circle cx={SIZE / 2} cy={SIZE / 2} r={SIZE / 2 - 2} fill="url(#skyBg)" stroke="rgba(197,160,40,0.15)" strokeWidth={1} />

          <g clipPath="url(#skyClip)">
            {/* 배경 별 */}
            {bgStars.map((s, i) => (
              <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={`rgba(255,255,255,${s.o})`} />
            ))}

            {/* 애스펙트 연결선 */}
            {aspectLines.map((a, i) => {
              const p1 = planetMap[a.planet1]
              const p2 = planetMap[a.planet2]
              if (!p1 || !p2) return null
              const isHighlighted = active === a.planet1 || active === a.planet2
              return (
                <line
                  key={i}
                  x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                  stroke={getAspectColor(a.type)}
                  strokeWidth={isHighlighted ? 1.5 : 0.8}
                  strokeDasharray={a.type === 'square' || a.type === 'opposition' ? '4,4' : '6,3'}
                  opacity={active ? (isHighlighted ? 1 : 0.2) : 0.6}
                  className="transition-opacity duration-200"
                />
              )
            })}

            {/* 행성들 */}
            {planets.map(p => {
              const isActive = active === p.name
              const dimmed = active && !isActive
              return (
                <g
                  key={p.name}
                  className="cursor-pointer transition-opacity duration-200"
                  opacity={dimmed ? 0.3 : 1}
                  onClick={() => setActive(isActive ? null : p.name)}
                >
                  {/* 글로우 */}
                  <circle cx={p.x} cy={p.y} r={p.size * 1.8} fill={p.color} opacity={isActive ? 0.2 : 0.08} />
                  {/* 본체 */}
                  <circle cx={p.x} cy={p.y} r={p.size / 2.5} fill={p.color} opacity={0.9} />
                  {/* 라벨 */}
                  <text
                    x={p.x} y={p.y + p.size / 2.5 + 12}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.6)"
                    fontSize="10"
                    fontFamily="Pretendard, sans-serif"
                  >
                    {p.name}
                  </text>
                </g>
              )
            })}
          </g>
        </svg>
      </div>

      {/* 툴팁 */}
      <div className="h-12 flex items-center justify-center mt-3">
        {activeNode ? (
          <p className="text-sm text-text-muted text-center px-4 animate-[fadeIn_0.2s]">
            {activeNode.tooltip}
          </p>
        ) : (
          <p className="text-xs text-text-muted/50 italic">별을 탭해서 자세히 보기</p>
        )}
      </div>
    </div>
  )
}
