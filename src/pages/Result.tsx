import { useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useChartStore } from '@/stores/chartStore'
import { generateReading } from '@/lib/generateReading'
import type { ReadingSection, StarBadge } from '@/lib/generateReading'
import type { BirthInput, ChartData } from '@/stores/chartStore'
import charResult from '@/assets/char-result.png'
import NightSky from '@/components/NightSky'

const BASIC_IDS = ['appearance', 'inner', 'communication']
const BASIC_LABEL: Record<string, string> = {
  appearance: '외면 · 첫인상',
  inner: '내면 · 감정',
  communication: '소통 · 사고',
}
const SECTION_ORDER = ['strengths', 'hiddenTalent', 'challenges', 'love', 'destinedPartner', 'career', 'lifeDirection']

function BadgeItem({ badge }: { badge: StarBadge }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-text-muted">
      <span className="font-serif text-gold-dark">{badge.symbol}</span>
      <span>{badge.sign}</span>
      {badge.house && <span className="text-gray-400">· {badge.house}하우스</span>}
    </span>
  )
}

function ContentBlock({ section, nickname }: { section: ReadingSection; nickname: string }) {
  return (
    <>
      {section.subtitle && (
        <p className="text-[15px] font-medium text-text mb-3 leading-snug">{section.subtitle}</p>
      )}

      {section.badges && section.badges.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3 border-l-2 border-gold/40 pl-3">
          {section.badges.map((b, i) => <BadgeItem key={i} badge={b} />)}
        </div>
      )}

      <p className="text-xs text-text-muted leading-relaxed mb-4 italic">
        {section.starMovement}
      </p>

      <div className="text-[15px] text-gray-600 space-y-3 leading-[1.85]">
        {section.body.split('\n\n').map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </>
  )
}

function loadResultData(search: string): { input: BirthInput; chart: ChartData } | null {
  try {
    const params = new URLSearchParams(search)
    const id = params.get('id')
    if (id) {
      const raw = sessionStorage.getItem(`byeoljido_result_${id}`)
      if (raw) return JSON.parse(raw)
    }
    return null
  } catch { return null }
}

export default function Result() {
  const navigate = useNavigate()
  const location = useLocation()
  const storeInput = useChartStore(s => s.input)
  const storeChart = useChartStore(s => s.chart)

  const data = useMemo(() => {
    return loadResultData(location.search) || (storeInput && storeChart ? { input: storeInput, chart: storeChart } : null)
  }, [location.search, storeInput, storeChart])

  useEffect(() => {
    if (!data) navigate('/input')
  }, [data, navigate])

  if (!data) return <div className="min-h-screen flex items-center justify-center text-text-muted">로딩 중...</div>
  const { input, chart } = data
  const reading = generateReading(chart, input.nickname)

  const basicSections = reading.sections.filter(s => BASIC_IDS.includes(s.id))
  const otherSections = SECTION_ORDER
    .map(id => reading.sections.find(s => s.id === id))
    .filter((s): s is ReadingSection => !!s)

  // 그룹핑
  const groups = [
    { sections: otherSections.filter(s => ['strengths', 'hiddenTalent', 'challenges'].includes(s.id)) },
    { sections: otherSections.filter(s => ['love', 'destinedPartner'].includes(s.id)) },
    { sections: otherSections.filter(s => ['career', 'lifeDirection'].includes(s.id)) },
  ]

  let globalIdx = 0

  return (
    <main className="max-w-lg mx-auto pb-24">

      {/* ── 헤더 ── */}
      <header className="pt-16 pb-8 px-6 text-center">
        <img src={charResult} alt="" width={64} height={64} className="rounded-full mx-auto mb-4 shadow-sm border border-border object-cover object-top" />
        <h1 className="text-2xl font-serif text-text leading-snug mb-3">
          {input.nickname}님이 태어나던<br />순간의 하늘
        </h1>
        <p className="text-sm text-text-muted">
          {input.year}. {input.month}. {input.day}. &ensp;{String(input.hour).padStart(2, '0')}:{String(input.minute).padStart(2, '0')}&ensp;·&ensp;{input.city.name}
        </p>
      </header>

      {/* ── 밤하늘 ── */}
      <section className="px-6 mb-14">
        <NightSky chart={chart} />
      </section>

      {/* ── 차트 요약 ── */}
      <section className="px-6 mb-16">
        <p className="text-xs text-text-muted tracking-widest uppercase mb-2 font-serif">Chart Overview</p>
        <h2 className="text-xl font-serif text-text mb-2">{reading.chartSummary.title}</h2>
        <div className="w-8 h-0.5 bg-gold mb-5" />
        {reading.chartSummary.body.split('\n\n').map((p, i) => (
          <p key={i} className="text-[15px] leading-[1.85] text-gray-600 mb-3">{p}</p>
        ))}
      </section>

      {/* ── 기본 성향 ── */}
      <section className="px-6 mb-14">
        <p className="text-xs text-text-muted tracking-widest uppercase mb-2 font-serif">Personality</p>
        <h2 className="text-xl font-serif text-text mb-1">타고난 기본 성향</h2>
        <p className="text-sm text-text-muted mb-6">당신의 자아, 감정, 그리고 첫인상</p>

        <div className="space-y-8">
          {basicSections.map((section, i) => (
            <div key={section.id}>
              {/* 넘버 + 라벨 */}
              <div className="flex items-baseline gap-3 mb-3">
                <span className="font-serif text-2xl text-gold font-bold leading-none">{i + 1}</span>
                <div>
                  <span className="text-[11px] text-text-muted tracking-wide">{BASIC_LABEL[section.id]}</span>
                  <h3 className="text-base font-bold text-text -mt-0.5">{section.title}</h3>
                </div>
              </div>

              <div className="pl-9">
                <ContentBlock section={section} nickname={input.nickname} />
              </div>

              {i < basicSections.length - 1 && (
                <div className="border-b border-dashed border-border mt-8" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── 나머지 섹션들 ── */}
      {groups.map((group, gi) => (
        <section key={gi} className="px-6 mb-14">
          {gi > 0 && <div className="border-t border-border pt-10 mb-0" />}

          <div className="space-y-10">
            {group.sections.map(section => {
              globalIdx++
              return (
                <div key={section.id}>
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="font-serif text-2xl text-gold font-bold leading-none">{globalIdx + 3}</span>
                    <div>
                      <h3 className="text-base font-bold text-text">{section.title}</h3>
                    </div>
                  </div>

                  <div className="pl-9">
                    <ContentBlock section={section} nickname={input.nickname} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ))}

      {/* ── 마무리 ── */}
      <footer className="mt-16 px-6 text-center">
        <div className="w-8 h-0.5 bg-gold mx-auto mb-6" />
        <p className="text-[15px] text-text-muted font-serif leading-loose mb-8">
          별들은 당신을 이끄는 것이 아니라,<br />당신이 가진 가능성을 비춰주는 거울입니다.
        </p>
        <button
          onClick={() => navigate('/input')}
          className="px-6 py-3 bg-text text-white rounded-lg transition-colors cursor-pointer hover:bg-gray-700 text-sm"
        >
          새로운 별지도 만들기
        </button>
        <div className="mt-8 text-xs text-gray-400">&copy; 2026 별지도</div>
      </footer>
    </main>
  )
}
