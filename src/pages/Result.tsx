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
  appearance: 'The Mask',
  inner: 'The Soul',
  communication: 'The Voice',
}
const BASIC_KR: Record<string, string> = {
  appearance: '세상이 보는 나',
  inner: '숨겨진 내면',
  communication: '소통하는 방식',
}
const SECTION_ORDER = ['strengths', 'hiddenTalent', 'challenges', 'love', 'destinedPartner', 'career', 'lifeDirection']

const CHAPTER_TITLES: Record<string, { en: string; kr: string }> = {
  strengths: { en: 'The Gift', kr: '빛을 발하는 장점' },
  hiddenTalent: { en: 'The Hidden Key', kr: '숨겨진 재능과 행운' },
  challenges: { en: 'The Trial', kr: '마주할 과제와 성장' },
  love: { en: 'The Heart', kr: '사랑과 관계' },
  destinedPartner: { en: 'The Fated One', kr: '운명의 상대' },
  career: { en: 'The Path', kr: '직업과 재물' },
  lifeDirection: { en: 'The Compass', kr: '삶의 흐름과 방향' },
}

function BadgeItem({ badge }: { badge: StarBadge }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
      <span className="font-display text-base text-gold italic">{badge.symbol}</span>
      <span>{badge.sign}</span>
      {badge.house && <span className="opacity-50">— {badge.house}하우스</span>}
    </span>
  )
}

function Ornament({ text }: { text?: string }) {
  return (
    <div className="ornament my-16">
      {text || '✦'}
    </div>
  )
}

function ChapterBlock({ num, enTitle, section, nickname }: {
  num: number
  enTitle: string
  section: ReadingSection
  nickname: string
}) {
  return (
    <div className="mb-20">
      {/* 챕터 헤더 */}
      <div className="mb-10">
        <p className="font-display text-sm italic text-text-muted tracking-wide mb-1">
          Chapter {String(num).padStart(2, '0')}
        </p>
        <p className="font-display text-3xl italic text-gold mb-2 leading-tight">{enTitle}</p>
        <h3 className="text-xl font-serif text-text">{section.title}</h3>
      </div>

      {/* subtitle */}
      {section.subtitle && (
        <p className="text-base text-text font-medium leading-relaxed mb-6 border-l-2 border-gold/50 pl-4">
          {section.subtitle}
        </p>
      )}

      {/* 천문 근거 */}
      {section.badges && section.badges.length > 0 && (
        <div className="flex flex-wrap gap-x-5 gap-y-1 mb-6">
          {section.badges.map((b, i) => <BadgeItem key={i} badge={b} />)}
        </div>
      )}

      {/* 별의 움직임 */}
      <p className="text-[13px] text-text-muted leading-relaxed mb-8 font-serif italic">
        "{section.starMovement}"
      </p>

      {/* 본문 */}
      <div className="text-[15px] text-text/80 space-y-4 leading-[1.9]">
        {section.body.split('\n\n').map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
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

  if (!data) return <div className="min-h-screen flex items-center justify-center text-text-muted font-serif italic">별을 읽고 있습니다...</div>
  const { input, chart } = data
  const reading = generateReading(chart, input.nickname)

  const basicSections = reading.sections.filter(s => BASIC_IDS.includes(s.id))
  const otherSections = SECTION_ORDER
    .map(id => reading.sections.find(s => s.id === id))
    .filter((s): s is ReadingSection => !!s)

  return (
    <main className="max-w-lg mx-auto pb-32">

      {/* ══════ 표지 ══════ */}
      <header className="pt-24 pb-16 px-8 text-center">
        <p className="font-display text-sm italic text-text-muted tracking-[0.25em] mb-6">A Celestial Portrait of</p>
        <h1 className="font-display text-5xl italic text-gold mb-4 leading-[1.15]">
          {input.nickname}
        </h1>
        <div className="w-12 h-px bg-gold mx-auto mb-4" />
        <p className="text-sm text-text-muted leading-relaxed">
          {input.year}년 {input.month}월 {input.day}일 &ensp;
          {String(input.hour).padStart(2, '0')}:{String(input.minute).padStart(2, '0')}<br />
          {input.city.name}, {input.city.country}
        </p>
      </header>

      {/* ══════ 밤하늘 ══════ */}
      <section className="px-8 mb-8">
        <NightSky chart={chart} />
      </section>
      <p className="text-center font-display text-xs italic text-text-muted tracking-[0.2em] mb-20">
        The sky at the moment of your birth
      </p>

      <Ornament text="⟡" />

      {/* ══════ 차트 요약 (프롤로그) ══════ */}
      <section className="px-8 mb-20">
        <p className="font-display text-sm italic text-text-muted tracking-wide mb-1">Prologue</p>
        <p className="font-display text-3xl italic text-gold mb-2 leading-tight">The Celestial Blueprint</p>
        <h2 className="text-lg font-serif text-text mb-8">{reading.chartSummary.title}</h2>

        {reading.chartSummary.body.split('\n\n').map((p, i) => (
          <p key={i} className="text-[15px] leading-[1.9] text-text/80 mb-4">{p}</p>
        ))}
      </section>

      <Ornament />

      {/* ══════ 기본 성향 — The Three Pillars ══════ */}
      <section className="px-8 mb-8">
        <div className="text-center mb-16">
          <p className="font-display text-sm italic text-text-muted tracking-wide mb-1">Part One</p>
          <p className="font-display text-4xl italic text-gold mb-3 leading-tight">The Three Pillars</p>
          <h2 className="text-lg font-serif text-text">타고난 기본 성향</h2>
        </div>

        {basicSections.map((section, i) => (
          <div key={section.id} className="mb-20">
            {/* 소챕터 헤더 */}
            <div className="text-center mb-10">
              <span className="chapter-num text-5xl">{['I', 'II', 'III'][i]}</span>
              <p className="font-display text-xl italic text-gold mt-2 mb-1">{BASIC_LABEL[section.id]}</p>
              <h3 className="text-lg font-serif text-text">{BASIC_KR[section.id]}</h3>
            </div>

            {section.subtitle && (
              <p className="text-base text-text font-medium leading-relaxed mb-6 text-center italic">
                — {section.subtitle} —
              </p>
            )}

            {section.badges && section.badges.length > 0 && (
              <div className="flex justify-center flex-wrap gap-x-5 gap-y-1 mb-6">
                {section.badges.map((b, j) => <BadgeItem key={j} badge={b} />)}
              </div>
            )}

            <p className="text-[13px] text-text-muted leading-relaxed mb-8 font-serif italic text-center">
              "{section.starMovement}"
            </p>

            <div className="text-[15px] text-text/80 space-y-4 leading-[1.9]">
              {section.body.split('\n\n').map((p, j) => (
                <p key={j}>{p}</p>
              ))}
            </div>

            {i < basicSections.length - 1 && <Ornament text="·" />}
          </div>
        ))}
      </section>

      <Ornament text="⟡" />

      {/* ══════ Part Two — 강점과 성장 ══════ */}
      <section className="px-8">
        <div className="text-center mb-16">
          <p className="font-display text-sm italic text-text-muted tracking-wide mb-1">Part Two</p>
          <p className="font-display text-4xl italic text-gold mb-3 leading-tight">Light & Shadow</p>
          <h2 className="text-lg font-serif text-text">강점, 재능, 그리고 시련</h2>
        </div>

        {otherSections.filter(s => ['strengths', 'hiddenTalent', 'challenges'].includes(s.id)).map((section, i) => (
          <ChapterBlock
            key={section.id}
            num={i + 4}
            enTitle={CHAPTER_TITLES[section.id]?.en || ''}
            section={section}
            nickname={input.nickname}
          />
        ))}
      </section>

      <Ornament text="⟡" />

      {/* ══════ Part Three — 사랑 ══════ */}
      <section className="px-8">
        <div className="text-center mb-16">
          <p className="font-display text-sm italic text-text-muted tracking-wide mb-1">Part Three</p>
          <p className="font-display text-4xl italic text-gold mb-3 leading-tight">Love & Destiny</p>
          <h2 className="text-lg font-serif text-text">사랑과 운명</h2>
        </div>

        {otherSections.filter(s => ['love', 'destinedPartner'].includes(s.id)).map((section, i) => (
          <ChapterBlock
            key={section.id}
            num={i + 7}
            enTitle={CHAPTER_TITLES[section.id]?.en || ''}
            section={section}
            nickname={input.nickname}
          />
        ))}
      </section>

      <Ornament text="⟡" />

      {/* ══════ Part Four — 커리어와 인생 ══════ */}
      <section className="px-8">
        <div className="text-center mb-16">
          <p className="font-display text-sm italic text-text-muted tracking-wide mb-1">Part Four</p>
          <p className="font-display text-4xl italic text-gold mb-3 leading-tight">Vocation & Voyage</p>
          <h2 className="text-lg font-serif text-text">커리어와 인생의 방향</h2>
        </div>

        {otherSections.filter(s => ['career', 'lifeDirection'].includes(s.id)).map((section, i) => (
          <ChapterBlock
            key={section.id}
            num={i + 9}
            enTitle={CHAPTER_TITLES[section.id]?.en || ''}
            section={section}
            nickname={input.nickname}
          />
        ))}
      </section>

      <Ornament text="⟡" />

      {/* ══════ 에필로그 ══════ */}
      <footer className="px-8 text-center mt-8">
        <p className="font-display text-sm italic text-text-muted tracking-wide mb-1">Epilogue</p>
        <p className="font-display text-2xl italic text-gold mb-8 leading-tight">The Stars Within You</p>
        <img src={charResult} alt="" width={80} height={80} className="rounded-full mx-auto mb-6 object-cover object-top" />
        <p className="text-[15px] text-text-muted font-serif leading-loose mb-12">
          별들은 당신을 이끄는 것이 아니라,<br />
          당신 안에 이미 있는 빛을 비춰주는<br />
          거울일 뿐입니다.
        </p>

        <button
          onClick={() => navigate('/input')}
          className="px-8 py-3 border border-text text-text rounded-none transition-colors cursor-pointer hover:bg-text hover:text-white text-sm tracking-wider font-display"
        >
          Begin Another Reading
        </button>
        <div className="mt-12 text-[10px] text-text-muted/50 tracking-widest uppercase">&copy; 2026 별지도</div>
      </footer>
    </main>
  )
}
