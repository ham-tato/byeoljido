import type { ReactNode } from 'react'

// 강조할 패턴들: 핵심 성격 묘사, 비유, 결론적 문장의 키워드
const BOLD_PATTERNS = [
  // 핵심 성격 키워드
  /(?:타고난|숨겨진|가장 큰|가장 중요한|진정한|절대적인|궁극적인)\s*[가-힣]+/g,
  // "~의 소유자/달인/표본/마스터" 패턴
  /[가-힣]+(?:의 소유자|의 달인|의 표본|의 마스터|의 아이콘|의 천재|의 귀재)/g,
  // "~형/타입" 성격 분류
  /(?:외유내강|워커홀릭|만개형|롤러코스터|슈퍼컴퓨터|부메랑|불사조|폭발적|압도적)[가-힣\s]*/g,
  // 강조 부사 + 서술어
  /(?:절대|반드시|누구보다|가장|오히려|결코)\s+[가-힣]+(?:합니다|합니다\.|입니다|입니다\.|됩니다|됩니다\.)/g,
]

// **명시적 볼드** 마크다운 처리
function parseExplicitBold(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-text font-semibold">{part.slice(2, -2)}</strong>
    }
    return part
  })
}

// 자동 볼드 + 명시적 볼드 통합
export default function TextRenderer({ text, className }: { text: string; className?: string }) {
  // 먼저 명시적 **볼드** 처리
  if (text.includes('**')) {
    return <span className={className}>{parseExplicitBold(text)}</span>
  }

  // 자동 볼드: 핵심 구절만 강조
  let processed = text
  const boldRanges: [number, number][] = []

  for (const pattern of BOLD_PATTERNS) {
    let match
    const regex = new RegExp(pattern.source, pattern.flags)
    while ((match = regex.exec(processed)) !== null) {
      boldRanges.push([match.index, match.index + match[0].length])
    }
  }

  if (boldRanges.length === 0) {
    return <span className={className}>{text}</span>
  }

  // 겹치는 범위 병합
  boldRanges.sort((a, b) => a[0] - b[0])
  const merged: [number, number][] = [boldRanges[0]]
  for (let i = 1; i < boldRanges.length; i++) {
    const last = merged[merged.length - 1]
    if (boldRanges[i][0] <= last[1]) {
      last[1] = Math.max(last[1], boldRanges[i][1])
    } else {
      merged.push(boldRanges[i])
    }
  }

  // 조각 생성
  const nodes: ReactNode[] = []
  let cursor = 0
  for (const [start, end] of merged) {
    if (cursor < start) nodes.push(text.slice(cursor, start))
    nodes.push(<strong key={start} className="text-text font-semibold">{text.slice(start, end)}</strong>)
    cursor = end
  }
  if (cursor < text.length) nodes.push(text.slice(cursor))

  return <span className={className}>{nodes}</span>
}
