import { useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useChartStore } from '@/stores/chartStore'
import { generateReading } from '@/lib/generateReading'
import type { ReadingSection, StarBadge } from '@/lib/generateReading'
import type { BirthInput, ChartData } from '@/stores/chartStore'
import charResult from '@/assets/char-result.png'

const SECTION_GROUP: Record<string, string> = {
  appearance: '타고난 기본 성향',
  inner: '타고난 기본 성향',
  communication: '타고난 기본 성향',
}

const BASIC_LABEL: Record<string, string> = {
  appearance: '(1)',
  inner: '(2)',
  communication: '(3)',
}

// 섹션 순서 그룹핑: 기본성향 → 장점/재능 → 관계/사랑 → 커리어/인생
const SECTION_ORDER = [
  'strengths', 'hiddenTalent', 'challenges',
  'love', 'destinedPartner',
  'career', 'lifeDirection',
]

function BadgeItem({ badge }: { badge: StarBadge }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-xs">
      <span className="text-accent font-bold text-sm">{badge.symbol}</span>
      <span className="text-text-muted">{badge.label}</span>
      <span className="text-accent font-medium">{badge.sign}</span>
      {badge.house && <span className="text-text-muted">{badge.house}H</span>}
    </div>
  )
}

function SectionCard({ section, nickname, showTitle = true }: { section: ReadingSection; nickname: string; showTitle?: boolean }) {
  return (
    <div className="mb-10">
      {showTitle && (
        <h3 className="text-lg font-bold text-text mb-1">{section.title}</h3>
      )}
      {section.subtitle && (
        <p className="text-gold font-medium mb-3">{section.subtitle}</p>
      )}
      {section.badges && section.badges.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {section.badges.map((badge, i) => (
            <BadgeItem key={i} badge={badge} />
          ))}
        </div>
      )}
      <div className="bg-bg-card/50 rounded-lg p-4 mb-3 border border-border/50">
        <p className="text-text-muted text-sm leading-relaxed">
          <span className="text-accent font-medium">별의 움직임: </span>
          {section.starMovement}
        </p>
      </div>
      <div className="text-text leading-relaxed">
        <p className="text-text-muted text-sm mb-2 font-medium">{nickname}님은?</p>
        {section.body.split('\n\n').map((paragraph, i) => (
          <p key={i} className="mb-3 text-[15px] leading-7">{paragraph}</p>
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
  } catch {
    return null
  }
}

export default function Result() {
  const navigate = useNavigate()
  const location = useLocation()
  const storeInput = useChartStore(s => s.input)
  const storeChart = useChartStore(s => s.chart)

  // sessionStorage → 탭별 독립, 없으면 스토어 폴백
  const data = useMemo(() => {
    return loadResultData(location.search) || (storeInput && storeChart ? { input: storeInput, chart: storeChart } : null)
  }, [location.search, storeInput, storeChart])

  useEffect(() => {
    if (!data) navigate('/input')
  }, [data, navigate])

  if (!data) return <div className="min-h-screen flex items-center justify-center text-text-muted">로딩 중...</div>
  const { input, chart } = data

  const reading = generateReading(chart, input.nickname)

  const basicSections = reading.sections.filter(s => SECTION_GROUP[s.id] === '타고난 기본 성향')
  const otherSections = SECTION_ORDER
    .map(id => reading.sections.find(s => s.id === id))
    .filter((s): s is ReadingSection => !!s)

  return (
    <div className="min-h-screen">
      {/* 헤더 + 캐릭터 */}
      <div className="text-center pt-10 pb-6 px-4">
        <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-2 border-gold/40 shadow-lg shadow-gold/10 mb-4">
          <img
            src={charResult}
            alt="결과를 안내하는 점성술사"
            width={128}
            height={128}
            className="w-full h-full object-cover object-top"
          />
        </div>
        <p className="text-accent text-sm mb-2">
          {input.year}년 {input.month}월 {input.day}일 {input.hour}시 {input.minute}분 &middot; {input.city.name}
        </p>
        <h1 className="text-2xl font-bold text-text mb-1">{input.nickname}님의 별지도</h1>
        <p className="text-text-muted text-sm">당신이 태어나던 순간의 하늘</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-20">
        {/* 차트 요약 */}
        <div className="mb-12 bg-bg-card rounded-xl p-6 border border-border">
          <h2 className="text-lg font-bold text-gold mb-4">
            차트 요약: {reading.chartSummary.title}
          </h2>
          {reading.chartSummary.body.split('\n\n').map((p, i) => (
            <p key={i} className="text-[15px] leading-7 text-text mb-3">{p}</p>
          ))}
        </div>

        {/* 타고난 기본 성향 */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-text mb-6 pb-2 border-b border-border">
            타고난 기본 성향
          </h2>
          <div className="space-y-4">
            {basicSections.map(section => (
              <div
                key={section.id}
                className="bg-bg-card/40 rounded-xl p-5 border border-border/40"
              >
                <h3 className="text-base font-bold text-accent mb-1">
                  {BASIC_LABEL[section.id]} {section.title}
                </h3>
                {section.subtitle && (
                  <p className="text-gold font-medium text-sm mb-3">{section.subtitle}</p>
                )}
                {section.badges && section.badges.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {section.badges.map((badge, i) => (
                      <BadgeItem key={i} badge={badge} />
                    ))}
                  </div>
                )}
                <div className="bg-bg/50 rounded-lg p-3.5 mb-3 border border-border/30">
                  <p className="text-text-muted text-sm leading-relaxed">
                    <span className="text-accent font-medium">별의 움직임: </span>
                    {section.starMovement}
                  </p>
                </div>
                <div className="text-text leading-relaxed">
                  <p className="text-text-muted text-sm mb-2 font-medium">{input.nickname}님은?</p>
                  {section.body.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="mb-3 text-[15px] leading-7">{paragraph}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 나머지 섹션 — 제목은 h2 한번만 */}
        {otherSections.map(section => (
          <div key={section.id} className="mb-12">
            <h2 className="text-xl font-bold text-text mb-6 pb-2 border-b border-border">
              {section.title}
            </h2>
            <SectionCard section={section} nickname={input.nickname} showTitle={false} />
          </div>
        ))}

        {/* 하단 CTA */}
        <div className="text-center mt-16 mb-8">
          <p className="text-text-muted text-sm mb-4">다른 사람의 별지도도 궁금하신가요?</p>
          <button
            onClick={() => navigate('/input')}
            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors cursor-pointer"
          >
            새로운 별지도 만들기
          </button>
        </div>
      </div>
    </div>
  )
}
