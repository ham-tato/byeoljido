import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useChartStore } from '@/stores/chartStore'
import { generateReading } from '@/lib/generateReading'
import { calculateChart } from '@/lib/astro'
import type { ReadingSection, StarBadge } from '@/lib/generateReading'
import type { BirthInput, ChartData } from '@/stores/chartStore'
import NightSky from '@/components/NightSky'
import TextRenderer from '@/components/TextRenderer'
import LifeCycleGraph from '@/components/LifeCycleGraph'

// 점성술 천궁도 아이콘
function AstroIcon() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-6 nc-breathe">
      <circle cx="36" cy="36" r="33" stroke="#C5A028" strokeWidth="0.75" opacity="0.5"/>
      <circle cx="36" cy="36" r="20" stroke="#C5A028" strokeWidth="0.5" opacity="0.35"/>
      <line x1="36" y1="3" x2="36" y2="69" stroke="#C5A028" strokeWidth="0.5" opacity="0.2"/>
      <line x1="3" y1="36" x2="69" y2="36" stroke="#C5A028" strokeWidth="0.5" opacity="0.2"/>
      <line x1="13" y1="13" x2="59" y2="59" stroke="#C5A028" strokeWidth="0.5" opacity="0.12"/>
      <line x1="59" y1="13" x2="13" y2="59" stroke="#C5A028" strokeWidth="0.5" opacity="0.12"/>
      <circle cx="36" cy="4" r="2" fill="#C5A028" opacity="0.8"/>
      <circle cx="68" cy="36" r="2" fill="#C5A028" opacity="0.8"/>
      <circle cx="36" cy="68" r="2" fill="#C5A028" opacity="0.8"/>
      <circle cx="4" cy="36" r="2" fill="#C5A028" opacity="0.8"/>
      <circle cx="58" cy="14" r="1.2" fill="#C5A028" opacity="0.5"/>
      <circle cx="14" cy="58" r="1.2" fill="#C5A028" opacity="0.5"/>
      <text x="36" y="41" textAnchor="middle" fontSize="13" fill="#C5A028" fontFamily="serif">✦</text>
    </svg>
  )
}

// 공유 URL 생성 (입력값을 base64로 인코딩)
function generateShareUrl(input: BirthInput): string {
  const encoded = btoa(encodeURIComponent(JSON.stringify(input)))
  return `${window.location.origin}/result?d=${encoded}`
}

const BASIC_IDS = ['appearance', 'inner', 'communication']
const SECTION_ORDER = ['strengths', 'hiddenTalent', 'challenges', 'love', 'destinedPartner', 'career', 'lifeDirection']

function BadgeItem({ badge }: { badge: StarBadge }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
      <span className="font-display text-base text-gold italic">{badge.symbol}</span>
      <span>{badge.sign}</span>
      {badge.house && <span className="opacity-50">· {badge.house}하우스</span>}
    </span>
  )
}

function Ornament() {
  return (
    <div className="ornament my-20">✦</div>
  )
}

function BodyText({ text }: { text: string }) {
  return (
    <div className="text-[15px] text-text/75 space-y-4 leading-[1.9]">
      {text.split('\n\n').map((p, i) => (
        <p key={i}><TextRenderer text={p} /></p>
      ))}
    </div>
  )
}

function ChapterSection({ num, section }: { num: string; section: ReadingSection }) {
  return (
    <div className="mb-24">
      {/* 챕터 넘버 + 제목 */}
      <div className="mb-10">
        <span className="chapter-num text-6xl">{num}</span>
        <h3 className="text-2xl font-serif text-text mt-3 mb-2">{section.title}</h3>
        {section.subtitle && (
          <p className="text-[15px] text-text-muted leading-relaxed italic">
            — {section.subtitle}
          </p>
        )}
      </div>

      {/* 천문 근거 + 별의 움직임 (좌측 구분선 연결) */}
      <div className="border-l border-gold/40 pl-4 mb-8">
        {section.badges && section.badges.length > 0 && (
          <div className="flex flex-wrap gap-x-5 gap-y-1 mb-3">
            {section.badges.map((b, i) => <BadgeItem key={i} badge={b} />)}
          </div>
        )}
        <p className="text-[13px] text-text-muted/70 leading-relaxed italic">
          {section.starMovement}
        </p>
      </div>

      {/* 본문 */}
      <BodyText text={section.body} />

      {/* 실천 조언 */}
      {section.action && (
        <div className="mt-8 px-4 py-4 border-l-2 border-gold/60" style={{ background: 'rgba(197,160,40,0.06)' }}>
          <p className="text-[10px] tracking-[0.2em] uppercase text-gold/70 mb-2 font-display">그래서 어떻게 할까요</p>
          <p className="text-[14px] text-text/80 leading-relaxed">{section.action}</p>
        </div>
      )}
    </div>
  )
}

function loadResultData(search: string): { input: BirthInput; chart: ChartData } | null {
  try {
    const params = new URLSearchParams(search)

    // 공유 링크: ?d=base64(input)
    const d = params.get('d')
    if (d) {
      const input = JSON.parse(decodeURIComponent(atob(d))) as BirthInput
      const chart = calculateChart(
        input.year, input.month, input.day,
        input.hour, input.minute,
        input.city.lat, input.city.lng,
      )
      return { input, chart }
    }

    // 일반 결과: ?id=sessionStorageKey
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
  const [copied, setCopied] = useState(false)

  async function handleShare(input: BirthInput) {
    const url = generateShareUrl(input)
    if (navigator.share) {
      await navigator.share({ title: `${input.nickname}님의 별지도`, url })
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const data = useMemo(() => {
    return loadResultData(location.search) || (storeInput && storeChart ? { input: storeInput, chart: storeChart } : null)
  }, [location.search, storeInput, storeChart])

  useEffect(() => {
    if (!data) navigate('/input')
  }, [data, navigate])

  if (!data) return <div className="min-h-screen flex items-center justify-center text-text-muted font-serif italic">별을 읽고 있습니다...</div>
  const { input, chart } = data
  const reading = generateReading(chart, input.nickname)

  const basicSections = reading.sections.filter(s => BASIC_IDS.includes(s.id))
  const otherSections = SECTION_ORDER
    .map(id => reading.sections.find(s => s.id === id))
    .filter((s): s is ReadingSection => !!s)

  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

  return (
    <main className="max-w-lg mx-auto pb-32">

      {/* ══════════════════════════════
           표지
         ══════════════════════════════ */}
      <header className="pt-28 pb-20 px-8 text-center">
        <p className="text-[11px] text-text-muted tracking-[0.3em] uppercase mb-8 font-display">
          A Celestial Portrait
        </p>

        <h1 className="text-4xl text-text mb-3 leading-snug" style={{ fontFamily: "'Cafe24Classictype', cursive" }}>
          {input.nickname}님의 별지도
        </h1>

        <div className="flex items-center justify-center gap-3 my-6">
          <div className="w-12 h-px bg-gold/60" />
          <span className="text-gold text-xs">✦</span>
          <div className="w-12 h-px bg-gold/60" />
        </div>

        <p className="text-sm text-text-muted leading-relaxed">
          {input.year}년 {input.month}월 {input.day}일&ensp;
          {String(input.hour).padStart(2, '0')}시 {String(input.minute).padStart(2, '0')}분<br />
          <span className="text-xs">{input.city.name}, {input.city.country}</span>
        </p>
      </header>

      {/* ══════════════════════════════
           밤하늘
         ══════════════════════════════ */}
      <section className="px-8 mb-6">
        <NightSky chart={chart} />
      </section>
      <p className="text-center text-[10px] text-text-muted/50 tracking-[0.2em] uppercase font-display mb-24">
        The sky at the moment of birth
      </p>

      <Ornament />

      {/* ══════════════════════════════
           서문 — 차트 요약
         ══════════════════════════════ */}
      <section className="px-8 mb-24">
        <p className="text-[10px] text-text-muted tracking-[0.25em] uppercase mb-3 font-display">Prologue</p>
        <h2 className="text-2xl font-serif text-text mb-2">당신이 태어나던 순간의 하늘</h2>
        <p className="text-sm text-text-muted italic mb-8">{reading.chartSummary.title}</p>

        <BodyText text={reading.chartSummary.body} />
      </section>

      <Ornament />

      {/* ══════════════════════════════
           제1장 — 타고난 기본 성향
         ══════════════════════════════ */}
      <section className="px-8">
        <div className="text-center mb-20">
          <p className="text-[10px] text-text-muted tracking-[0.25em] uppercase mb-3 font-display">Part One</p>
          <h2 className="text-3xl font-serif text-text mb-2">타고난 기본 성향</h2>
          <p className="text-sm text-text-muted">당신의 자아, 감정, 그리고 첫인상을 결정하는 세 개의 기둥</p>
        </div>

        {basicSections.map((section, i) => (
          <ChapterSection key={section.id} num={romanNumerals[i]} section={section} />
        ))}
      </section>

      <Ornament />

      {/* ══════════════════════════════
           제2장 — 강점과 성장
         ══════════════════════════════ */}
      <section className="px-8">
        <div className="text-center mb-20">
          <p className="text-[10px] text-text-muted tracking-[0.25em] uppercase mb-3 font-display">Part Two</p>
          <h2 className="text-3xl font-serif text-text mb-2">빛과 그림자</h2>
          <p className="text-sm text-text-muted">당신이 타고난 매력, 숨겨진 재능, 그리고 넘어야 할 벽</p>
        </div>

        {otherSections.filter(s => ['strengths', 'hiddenTalent', 'challenges'].includes(s.id)).map((section, i) => (
          <ChapterSection key={section.id} num={romanNumerals[i + 3]} section={section} />
        ))}
      </section>

      <Ornament />

      {/* ══════════════════════════════
           제3장 — 사랑과 운명
         ══════════════════════════════ */}
      <section className="px-8">
        <div className="text-center mb-20">
          <p className="text-[10px] text-text-muted tracking-[0.25em] uppercase mb-3 font-display">Part Three</p>
          <h2 className="text-3xl font-serif text-text mb-2">사랑과 운명</h2>
          <p className="text-sm text-text-muted">당신의 연애 방식과 운명이 이끄는 상대</p>
        </div>

        {otherSections.filter(s => ['love', 'destinedPartner'].includes(s.id)).map((section, i) => (
          <ChapterSection key={section.id} num={romanNumerals[i + 6]} section={section} />
        ))}
      </section>

      <Ornament />

      {/* ══════════════════════════════
           제4장 — 커리어와 인생
         ══════════════════════════════ */}
      <section className="px-8">
        <div className="text-center mb-20">
          <p className="text-[10px] text-text-muted tracking-[0.25em] uppercase mb-3 font-display">Part Four</p>
          <h2 className="text-3xl font-serif text-text mb-2">항해의 방향</h2>
          <p className="text-sm text-text-muted">직업적 성취와 이번 생의 여정이 향하는 곳</p>
        </div>

        {otherSections.filter(s => ['career', 'lifeDirection'].includes(s.id)).map((section, i) => (
          section.id === 'lifeDirection' ? (
            <div key={section.id} className="mb-24">
              {/* 챕터 넘버 + 제목 */}
              <div className="mb-6">
                <span className="chapter-num text-6xl">{romanNumerals[i + 8]}</span>
                <h3 className="text-2xl font-serif text-text mt-3 mb-2">{section.title}</h3>
                {section.subtitle && (
                  <p className="text-[15px] text-text-muted leading-relaxed italic">
                    — {section.subtitle}
                  </p>
                )}
              </div>

              <LifeCycleGraph birthYear={input.year} />

              {/* 구분 */}
              <div className="mt-10 mb-6">
                <p className="text-[10px] text-text-muted tracking-[0.25em] uppercase mb-1 font-display">북교점이 말하는</p>
                <h4 className="text-xl font-serif text-text">이번 생에서 나아가야 할 방향</h4>
              </div>

              {/* 천문 근거 */}
              <div className="border-l border-gold/40 pl-4 mb-8">
                {section.badges && section.badges.length > 0 && (
                  <div className="flex flex-wrap gap-x-5 gap-y-1 mb-3">
                    {section.badges.map((b, i) => <BadgeItem key={i} badge={b} />)}
                  </div>
                )}
                <p className="text-[13px] text-text-muted/70 leading-relaxed italic">{section.starMovement}</p>
              </div>

              <BodyText text={section.body} />

              {section.action && (
                <div className="mt-8 px-4 py-4 border-l-2 border-gold/60" style={{ background: 'rgba(197,160,40,0.06)' }}>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-gold/70 mb-2 font-display">그래서 어떻게 할까요</p>
                  <p className="text-[14px] text-text/80 leading-relaxed">{section.action}</p>
                </div>
              )}
            </div>
          ) : (
            <ChapterSection key={section.id} num={romanNumerals[i + 8]} section={section} />
          )
        ))}
      </section>

      <Ornament />

      {/* ══════════════════════════════
           에필로그
         ══════════════════════════════ */}
      <footer className="px-8 text-center mt-4">
        <p className="text-[10px] text-text-muted tracking-[0.25em] uppercase mb-3 font-display">Epilogue</p>

        <AstroIcon />

        <p className="text-[16px] text-text/70 font-serif leading-loose mb-12">
          별들은 당신을 이끄는 것이 아니라,<br />
          당신 안에 이미 존재하는 빛을<br />
          비춰주는 거울일 뿐입니다.
        </p>

        {/* 공유 버튼 */}
        <button
          onClick={() => handleShare(input)}
          className="w-full max-w-xs py-3 mb-3 bg-gold hover:bg-gold-dark text-white text-sm tracking-wider transition-colors cursor-pointer font-sans"
        >
          {copied ? '링크가 복사됐어요 ✦' : '내 결과지 공유하기'}
        </button>

        <button
          onClick={() => navigate('/input')}
          className="w-full max-w-xs py-3 border border-text/30 text-text text-sm tracking-wider hover:bg-text hover:text-bg transition-colors cursor-pointer font-sans"
        >
          다른 별지도 펼쳐보기
        </button>

        <div className="mt-16 mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-px bg-border" />
            <span className="text-text-muted/40 text-[10px]">✦</span>
            <div className="w-8 h-px bg-border" />
          </div>
          <p className="text-[10px] text-text-muted/40 tracking-widest uppercase">&copy; 2026 별지도</p>
        </div>
      </footer>
    </main>
  )
}
