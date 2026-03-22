import { useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useChartStore } from '@/stores/chartStore'
import { generateReading } from '@/lib/generateReading'
import type { ReadingSection, StarBadge } from '@/lib/generateReading'
import type { BirthInput, ChartData } from '@/stores/chartStore'
import charResult from '@/assets/char-result.png'
import NightSky from '@/components/NightSky'

// ── 설정 ──

const BASIC_IDS = ['appearance', 'inner', 'communication']

const BASIC_META: Record<string, { emoji: string; label: string; color: string; borderColor: string; bgColor: string }> = {
  appearance: { emoji: '🪞', label: '외면 · 첫인상', color: 'text-amber-600', borderColor: 'border-t-amber-400', bgColor: 'bg-amber-50' },
  inner: { emoji: '🌙', label: '내면 · 감정', color: 'text-slate-600', borderColor: 'border-t-slate-400', bgColor: 'bg-slate-50' },
  communication: { emoji: '💬', label: '소통 · 사고', color: 'text-cyan-600', borderColor: 'border-t-cyan-400', bgColor: 'bg-cyan-50' },
}

const SECTION_META: Record<string, { emoji: string; label: string; iconColor: string; bgColor: string }> = {
  strengths: { emoji: '✨', label: '강점과 매력', iconColor: 'text-amber-500', bgColor: 'bg-amber-50' },
  hiddenTalent: { emoji: '🍀', label: '재능과 행운', iconColor: 'text-emerald-500', bgColor: 'bg-emerald-50' },
  challenges: { emoji: '🔥', label: '과제와 성장', iconColor: 'text-red-500', bgColor: 'bg-red-50' },
  love: { emoji: '💘', label: '사랑과 관계', iconColor: 'text-pink-500', bgColor: 'bg-pink-50' },
  destinedPartner: { emoji: '💫', label: '운명의 상대', iconColor: 'text-violet-500', bgColor: 'bg-violet-50' },
  career: { emoji: '💼', label: '직업과 재물', iconColor: 'text-blue-500', bgColor: 'bg-blue-50' },
  lifeDirection: { emoji: '🧭', label: '삶의 방향', iconColor: 'text-teal-500', bgColor: 'bg-teal-50' },
}

const SECTION_ORDER = ['strengths', 'hiddenTalent', 'challenges', 'love', 'destinedPartner', 'career', 'lifeDirection']

// ── 컴포넌트 ──

function BadgeItem({ badge }: { badge: StarBadge }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600">
      <span className="font-bold text-gold-dark">{badge.symbol}</span>
      <span>{badge.sign}</span>
      {badge.house && <span className="text-gray-400">{badge.house}H</span>}
    </span>
  )
}

function Divider() {
  return <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent my-10" />
}

function SectionArticle({ section, nickname, meta }: {
  section: ReadingSection
  nickname: string
  meta: { emoji: string; label: string; iconColor: string; bgColor: string }
}) {
  return (
    <article className="bg-bg-card rounded-2xl p-6 border border-border shadow-sm">
      <header className="flex items-center gap-4 mb-4">
        <div className={`w-12 h-12 rounded-xl ${meta.bgColor} flex items-center justify-center text-2xl`}>
          {meta.emoji}
        </div>
        <div>
          <div className="text-[11px] text-text-muted font-bold tracking-wide uppercase">{meta.label}</div>
          <h3 className="text-lg font-bold text-text">{section.title}</h3>
        </div>
      </header>

      {section.subtitle && (
        <p className="text-gold-dark font-semibold text-[15px] mb-4">{section.subtitle}</p>
      )}

      {section.badges && section.badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {section.badges.map((b, i) => <BadgeItem key={i} badge={b} />)}
        </div>
      )}

      <div className="bg-bg-input rounded-xl p-4 mb-4 border border-border/60">
        <p className="text-text-muted text-sm leading-relaxed">
          <span className="text-gold-dark font-semibold">별의 움직임 — </span>
          {section.starMovement}
        </p>
      </div>

      <div className="text-[15px] text-gray-600 space-y-3 leading-relaxed">
        <p className="text-text-muted text-sm font-semibold">{nickname}님은?</p>
        {section.body.split('\n\n').map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </article>
  )
}

// ── 데이터 로드 ──

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

// ── 메인 ──

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

  return (
    <main className="max-w-md mx-auto pb-24">

      {/* ── 1. 헤더 ── */}
      <header className="pt-16 pb-10 px-6 text-center">
        <div className="inline-block p-3 rounded-full bg-bg-card shadow-sm border border-border mb-5">
          <img src={charResult} alt="" width={56} height={56} className="rounded-full object-cover object-top" />
        </div>
        <h1 className="text-2xl font-serif text-text mb-4 leading-snug">
          {input.nickname}님이 태어나던<br />순간의 하늘
        </h1>
        <div className="inline-flex flex-col items-center gap-1 py-3 px-6 rounded-2xl bg-bg-card border border-border text-sm shadow-sm">
          <span className="font-medium">
            📅 {input.year}년 {input.month}월 {input.day}일 {input.hour}시 {input.minute}분
          </span>
          <span className="text-xs text-text-muted">📍 {input.city.name}, {input.city.country}</span>
        </div>
      </header>

      {/* ── 2. 밤하늘 시각화 ── */}
      <section className="px-6 mb-12">
        <NightSky chart={chart} />
        <p className="text-center text-[11px] text-text-muted mt-3 tracking-widest uppercase font-serif">
          {input.nickname}'s Natal Sky
        </p>
      </section>

      {/* ── 3. 차트 요약 ── */}
      <section className="px-6 mb-12">
        <div className="bg-bg-card rounded-2xl p-6 border border-border shadow-sm">
          <h2 className="text-lg font-serif font-bold text-text mb-1">
            🔮 차트 요약
          </h2>
          <p className="text-gold-dark font-semibold text-sm mb-4">{reading.chartSummary.title}</p>
          {reading.chartSummary.body.split('\n\n').map((p, i) => (
            <p key={i} className="text-[15px] leading-7 text-gray-600 mb-3">{p}</p>
          ))}
        </div>
      </section>

      {/* ── 4. 운명의 세 기둥 (Big Three) ── */}
      <section className="px-6 mb-12">
        <div className="mb-5">
          <span className="text-xs font-bold text-gold-dark tracking-widest uppercase block mb-1">Big Three</span>
          <h2 className="text-2xl font-serif text-text">🌟 타고난 기본 성향</h2>
          <p className="text-sm text-text-muted mt-1">당신의 자아, 감정, 그리고 첫인상</p>
        </div>

        <div className="space-y-4">
          {basicSections.map(section => {
            const meta = BASIC_META[section.id]
            return (
              <div key={section.id} className={`bg-bg-card rounded-2xl p-6 border border-border shadow-sm border-t-4 ${meta.borderColor}`}>
                <header className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${meta.bgColor} flex items-center justify-center text-2xl`}>
                    {meta.emoji}
                  </div>
                  <div>
                    <div className="text-[11px] text-text-muted font-bold tracking-wide">{meta.label}</div>
                    <h3 className="text-lg font-bold text-text">{section.title}</h3>
                  </div>
                </header>

                {section.subtitle && (
                  <p className="text-gold-dark font-semibold text-sm mb-3">{section.subtitle}</p>
                )}

                {section.badges && section.badges.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {section.badges.map((b, i) => <BadgeItem key={i} badge={b} />)}
                  </div>
                )}

                <div className="bg-bg-input rounded-xl p-3.5 mb-4 border border-border/60">
                  <p className="text-text-muted text-sm leading-relaxed">
                    <span className="text-gold-dark font-semibold">별의 움직임 — </span>
                    {section.starMovement}
                  </p>
                </div>

                <div className="text-[15px] text-gray-600 space-y-3 leading-relaxed">
                  <p className="text-text-muted text-sm font-semibold">{input.nickname}님은?</p>
                  {section.body.split('\n\n').map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <Divider />

      {/* ── 5. 나머지 섹션들 ── */}
      <section className="px-6 space-y-6">
        {otherSections.map((section, idx) => {
          const meta = SECTION_META[section.id]
          if (!meta) return null

          // 그룹 구분선: 장점/재능/과제 → 사랑/운명 → 커리어/방향
          const showGroupHeader = idx === 0 || idx === 3 || idx === 5
          const groupHeaders: Record<number, { label: string; title: string; desc: string }> = {
            0: { label: 'Strengths & Growth', title: '강점과 성장', desc: '빛나는 매력과 성장의 기회' },
            3: { label: 'Love & Relationships', title: '사랑과 관계', desc: '연애 스타일과 운명의 파트너' },
            5: { label: 'Career & Life Path', title: '커리어와 인생', desc: '직업적 성취와 삶의 방향' },
          }

          return (
            <div key={section.id}>
              {showGroupHeader && groupHeaders[idx] && (
                <div className={`${idx > 0 ? 'mt-8 pt-10 border-t border-border' : ''} mb-6`}>
                  <span className="text-xs font-bold text-gold-dark tracking-widest uppercase block mb-1">
                    {groupHeaders[idx].label}
                  </span>
                  <h2 className="text-2xl font-serif text-text">{groupHeaders[idx].title}</h2>
                  <p className="text-sm text-text-muted mt-1">{groupHeaders[idx].desc}</p>
                </div>
              )}
              <SectionArticle section={section} nickname={input.nickname} meta={meta} />
            </div>
          )
        })}
      </section>

      {/* ── 하단 마무리 ── */}
      <footer className="mt-20 px-6 text-center">
        <p className="text-[15px] text-text-muted font-serif leading-loose mb-6">
          별들은 당신을 이끄는 것이 아니라,<br />당신이 가진 빛나는 가능성을 비춰주는 거울입니다.
        </p>
        <button
          onClick={() => navigate('/input')}
          className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl transition-colors cursor-pointer shadow-sm"
        >
          새로운 별지도 만들기
        </button>
        <div className="mt-8 text-xs text-gray-400">
          &copy; 2026 별지도. All rights reserved.
        </div>
      </footer>
    </main>
  )
}
