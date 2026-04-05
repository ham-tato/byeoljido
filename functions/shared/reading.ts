export interface PreviewSection {
  chapter: string
  title: string
  subtitle?: string
  firstSentence: string
}

export interface FullReading {
  chartSummary: { title: string; body: string }
  sections: Array<{
    id: string
    title: string
    subtitle?: string
    badges?: Array<{ symbol: string; label: string; sign: string; house?: number }>
    starMovement: string
    body: string
    action?: string
  }>
}

export function extractPreview(reading: FullReading): PreviewSection[] {
  const preview: PreviewSection[] = []

  // 프롤로그
  preview.push({
    chapter: 'prologue',
    title: '당신이 태어나던 순간의 하늘',
    subtitle: reading.chartSummary.title,
    firstSentence: reading.chartSummary.body.split('\n\n')[0].split('. ')[0] + '.',
  })

  // 각 섹션
  for (const section of reading.sections) {
    preview.push({
      chapter: section.id,
      title: section.title,
      subtitle: section.subtitle,
      firstSentence: section.body.split('\n\n')[0].split('. ')[0] + '.',
    })
  }

  return preview
}
