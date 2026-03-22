import type { ReactNode } from 'react'

// 문단별 최소 1개 볼드를 보장하기 위해 넓은 기준
const BOLD_PATTERNS = [
  // 핵심 성격 수식어 + 명사 (넓게)
  /(?:타고난|숨겨진|가장|진정한|절대적인|궁극적인|놀라운|엄청난|강렬한|탁월한|뛰어난|독보적인|압도적인|폭발적인|무한한|극도의|남다른)\s?[가-힣]{2,}/g,
  // "~의 ~자/인" 역할 수식
  /[가-힣]{2,}(?:의 소유자|의 달인|의 표본|의 마스터|의 아이콘|의 천재|의 귀재|의 완성체|의 화신|의 원천|의 열쇠|의 무기)/g,
  // 콤팩트한 성격 라벨/비유
  /(?:외유내강|워커홀릭|만개형|롤러코스터|슈퍼컴퓨터|부메랑|불사조|해결사|팩폭러|스토리텔러|로맨티스트|탐험가|분석가|혁신가|개척자|야심가)[가-힣\s]*/g,
  // 강조 부사 + 서술
  /(?:절대|반드시|누구보다|오히려|결코|이것이야말로|바로 이것이)\s?[가-힣]+/g,
  // "~할 수 있습니다/됩니다" 결론문의 핵심 동사구
  /(?:빛을 발|진가를 발휘|두각을 나타|에너지를 얻|행운이 찾아|기회를 발견|성취를 이룰|보상으로 돌아)/g,
  // "~한 사람/매력/능력" 특성 요약
  /[가-힣]{2,}(?:한 매력|한 사람|한 능력|한 재능|한 강점|한 무기|한 존재|한 타입|한 성품)/g,
  // "~적인/~스러운" 형용사 + 명사
  /(?:현실적인|감성적인|직관적인|독립적인|창의적인|혁신적인|논리적인|본능적인|운명적인)\s?[가-힣]{1,4}/g,
  // 문장 끝 "~입니다/~이에요/~있습니다" 앞의 핵심어 (2~6자)
  /[가-힣]{2,6}(?=(?:입니다|이에요|있습니다|됩니다|합니다)[\.\s])/g,
]

function parseExplicitBold(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-text font-semibold">{part.slice(2, -2)}</strong>
    }
    return part
  })
}

export default function TextRenderer({ text, className }: { text: string; className?: string }) {
  if (text.includes('**')) {
    return <span className={className}>{parseExplicitBold(text)}</span>
  }

  const boldRanges: [number, number][] = []

  for (const pattern of BOLD_PATTERNS) {
    let match
    const regex = new RegExp(pattern.source, pattern.flags)
    while ((match = regex.exec(text)) !== null) {
      boldRanges.push([match.index, match.index + match[0].length])
    }
  }

  if (boldRanges.length === 0) {
    return <span className={className}>{text}</span>
  }

  // 병합
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
