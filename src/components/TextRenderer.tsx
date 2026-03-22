import type { ReactNode } from 'react'

// **볼드** 마크다운만 처리. 자동 볼드 없음.
export default function TextRenderer({ text }: { text: string }) {
  if (!text.includes('**')) return <>{text}</>

  const parts = text.split(/(\*\*[^*]+\*\*)/)
  const nodes: ReactNode[] = parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-text font-semibold">{part.slice(2, -2)}</strong>
    }
    return part
  })
  return <>{nodes}</>
}
