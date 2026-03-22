import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChartStore } from '@/stores/chartStore'
import { generateReading } from '@/lib/generateReading'
import type { ReadingSection } from '@/lib/generateReading'
import charResult from '@/assets/char-result.png'

const SECTION_LABELS: Record<string, string> = {
  appearance: '(1)',
  inner: '(2)',
  communication: '(3)',
}

const SECTION_GROUP: Record<string, string> = {
  appearance: '타고난 기본 성향',
  inner: '타고난 기본 성향',
  communication: '타고난 기본 성향',
}

function SectionCard({ section, nickname }: { section: ReadingSection; nickname: string }) {
  const label = SECTION_LABELS[section.id] || ''
  const displayTitle = label ? `${label} ${section.title}` : section.title

  return (
    <div className="mb-10">
      <h3 className="text-lg font-bold text-accent mb-1">{displayTitle}</h3>
      {section.subtitle && (
        <p className="text-gold font-medium mb-3">{section.subtitle}</p>
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

export default function Result() {
  const navigate = useNavigate()
  const { input, chart } = useChartStore()

  useEffect(() => {
    if (!input || !chart) {
      navigate('/input')
    }
  }, [input, chart, navigate])

  if (!input || !chart) return null

  const reading = generateReading(chart, input.nickname)

  // 그룹핑: 기본 성향 섹션
  const basicSections = reading.sections.filter(s => SECTION_GROUP[s.id] === '타고난 기본 성향')
  const otherSections = reading.sections.filter(s => !SECTION_GROUP[s.id])

  return (
    <div className="min-h-screen">
      {/* 헤더 + 캐릭터 */}
      <div className="text-center pt-10 pb-6 px-4">
        <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-2 border-gold/40 shadow-lg shadow-gold/10 mb-4">
          <img
            src={charResult}
            alt="결과를 안내하는 점성술사"
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
          {basicSections.map(section => (
            <SectionCard key={section.id} section={section} nickname={input.nickname} />
          ))}
        </div>

        {/* 나머지 섹션 */}
        {otherSections.map(section => (
          <div key={section.id} className="mb-12">
            <h2 className="text-xl font-bold text-text mb-6 pb-2 border-b border-border">
              {section.title}
            </h2>
            <SectionCard section={section} nickname={input.nickname} />
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
