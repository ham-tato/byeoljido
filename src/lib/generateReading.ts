import type { ChartData } from '@/stores/chartStore'
import { SIGN_ELEMENT, ASCENDANT_IN_SIGN, MOON_IN_SIGN, MERCURY_IN_SIGN } from '@/data/templates/signs'
import { VENUS_IN_SIGN } from '@/data/templates/venus'
import { MC_IN_SIGN } from '@/data/templates/career'
import { POSITIVE_ASPECTS, NEGATIVE_ASPECTS, getAspectKey } from '@/data/templates/aspects'
import { NORTH_NODE_IN_SIGN } from '@/data/templates/northNode'
import { HOUSE_CONTEXT } from '@/data/templates/houses'
import { APPEARANCE_SUBTITLE, INNER_SUBTITLE, COMMUNICATION_SUBTITLE, LOVE_SUBTITLE, CAREER_SUBTITLE, LIFE_DIRECTION_SUBTITLE } from '@/data/templates/subtitles'
import { eulReul, iGa, gwaWa } from '@/lib/particles'

export interface ReadingSection {
  id: string
  title: string
  subtitle?: string
  starMovement: string
  body: string
}

export interface Reading {
  chartSummary: {
    title: string
    body: string
  }
  sections: ReadingSection[]
}

function getElementMetaphor(sign: string) {
  return SIGN_ELEMENT[sign] || { element: '?', metaphor: sign, keyword: sign }
}

function generateChartSummary(chart: ChartData, nickname: string): { title: string; body: string } {
  const sunSign = chart.planets['태양']?.sign || '양자리'
  const moonSign = chart.planets['달']?.sign || '양자리'
  const ascSign = chart.ascendant.sign

  const sun = getElementMetaphor(sunSign)
  const moon = getElementMetaphor(moonSign)
  const asc = getElementMetaphor(ascSign)

  const title = `${sun.metaphor}${eulReul(sun.metaphor)} 품은 ${asc.metaphor}, 그리고 ${moon.metaphor}의 내면`

  const body = `${nickname}님이 태어난 날, 하늘의 별들은 아주 특별한 그림을 그리고 있었어요. ` +
    `가장 중요한 자아를 뜻하는 태양은 ${sun.metaphor}, ${sunSign}에 머물렀어요. ` +
    `이 별의 배치 덕분에 ${nickname}님은 ${sun.keyword}${eulReul(sun.keyword)} 부여받았죠. ` +
    `동시에 첫인상을 결정하는 동쪽 지평선에는 ${asc.metaphor}, ${ascSign}${iGa(ascSign)} 흐르고 있었어요.\n\n` +
    `여기에 깊은 내면을 상징하는 달은 ${moon.metaphor}, ${moonSign}의 기운을 가득 품고 있었네요. ` +
    `결과적으로 ${nickname}님은 ${sun.keyword}${gwaWa(sun.keyword)} ${asc.keyword}, ` +
    `그리고 ${moon.keyword}까지 골고루 갖춘 매력적인 사람으로 태어났어요.`

  return { title, body }
}

function generateAppearance(chart: ChartData): ReadingSection {
  const ascSign = chart.ascendant.sign
  const text = ASCENDANT_IN_SIGN[ascSign] || ''

  return {
    id: 'appearance',
    title: '남이 보는 나',
    subtitle: APPEARANCE_SUBTITLE[ascSign],
    starMovement: `당신의 첫인상과 사회적 가면을 뜻하는 상승궁이 ${ascSign}에 위치해 있습니다.`,
    body: text,
  }
}

function generateInnerSelf(chart: ChartData): ReadingSection {
  const moon = chart.planets['달']
  if (!moon) return { id: 'inner', title: '나의 숨겨진 내면', starMovement: '', body: '' }

  const house = HOUSE_CONTEXT[moon.house]
  const text = MOON_IN_SIGN[moon.sign] || ''

  return {
    id: 'inner',
    title: '나의 숨겨진 내면',
    subtitle: INNER_SUBTITLE[moon.sign],
    starMovement: `무의식과 감정을 상징하는 달이 ${moon.sign}에, ${house?.description || `${moon.house}하우스에 위치해 있습니다.`}`,
    body: text,
  }
}

function generateCommunication(chart: ChartData): ReadingSection {
  const mercury = chart.planets['수성']
  if (!mercury) return { id: 'communication', title: '내가 세상과 소통하는 방식', starMovement: '', body: '' }

  const house = HOUSE_CONTEXT[mercury.house]
  const text = MERCURY_IN_SIGN[mercury.sign] || ''

  return {
    id: 'communication',
    title: '내가 세상과 소통하는 방식',
    subtitle: COMMUNICATION_SUBTITLE[mercury.sign],
    starMovement: `소통과 사고방식을 뜻하는 수성이 ${mercury.sign}에, 그리고 ${house?.area || `${mercury.house}하우스`}인 ${mercury.house}하우스에 자리 잡고 있습니다.`,
    body: text,
  }
}

function generateStrengths(chart: ChartData): ReadingSection {
  const positiveTypes = ['trine', 'sextile'] as const
  const positiveAspects = chart.aspects.filter(a =>
    positiveTypes.includes(a.type as typeof positiveTypes[number])
  )

  // 가장 오브가 작은 (정확한) 긍정 애스펙트 선택
  positiveAspects.sort((a, b) => a.orb - b.orb)

  for (const aspect of positiveAspects) {
    const key = getAspectKey(aspect.planet1, aspect.planet2)
    const template = POSITIVE_ASPECTS[key]
    if (template) {
      const typeName = aspect.type === 'trine' ? '트라인(120°)' : '섹스타일(60°)'
      return {
        id: 'strengths',
        title: '빛을 발하는 장점과 나만의 매력',
        subtitle: template.title,
        starMovement: `${aspect.planet1}${gwaWa(aspect.planet1)} ${aspect.planet2}${iGa(aspect.planet2)} 서로를 밀어주는 아주 긍정적인 각도(${typeName})를 맺고 있습니다.`,
        body: template.body,
      }
    }
  }

  // 폴백: 태양-화성 기본
  const fallback = POSITIVE_ASPECTS['태양-화성']!
  return {
    id: 'strengths',
    title: '빛을 발하는 장점과 나만의 매력',
    subtitle: fallback.title,
    starMovement: '태양과 화성이 서로 조화로운 에너지를 주고받고 있습니다.',
    body: fallback.body,
  }
}

function generateChallenges(chart: ChartData): ReadingSection {
  const negativeTypes = ['square', 'opposition'] as const
  const negativeAspects = chart.aspects.filter(a =>
    negativeTypes.includes(a.type as typeof negativeTypes[number])
  )

  negativeAspects.sort((a, b) => a.orb - b.orb)

  for (const aspect of negativeAspects) {
    const key = getAspectKey(aspect.planet1, aspect.planet2)
    const template = NEGATIVE_ASPECTS[key]
    if (template) {
      const typeName = aspect.type === 'square' ? '스퀘어(90°)' : '오포지션(180°)'
      return {
        id: 'challenges',
        title: '마주해야 할 과제와 성장의 열쇠',
        subtitle: template.title,
        starMovement: `${aspect.planet1}${gwaWa(aspect.planet1)} ${aspect.planet2}${iGa(aspect.planet2)} 팽팽하게 대립하는 긴장의 각도(${typeName})를 맺고 있습니다.`,
        body: template.body,
      }
    }
  }

  const fallback = NEGATIVE_ASPECTS['태양-토성']!
  return {
    id: 'challenges',
    title: '마주해야 할 과제와 성장의 열쇠',
    subtitle: fallback.title,
    starMovement: '토성의 무거운 에너지가 당신의 자아에 시련과 통제의 기운을 더하고 있습니다.',
    body: fallback.body,
  }
}

function generateLove(chart: ChartData): ReadingSection {
  const venus = chart.planets['금성']
  if (!venus) return { id: 'love', title: '사랑과 관계의 방정식', starMovement: '', body: '' }

  const house = HOUSE_CONTEXT[venus.house]
  const text = VENUS_IN_SIGN[venus.sign] || ''

  // 금성 관련 부정 애스펙트가 있으면 추가
  const venusAspects = chart.aspects.filter(a =>
    (a.planet1 === '금성' || a.planet2 === '금성') &&
    (a.type === 'square' || a.type === 'opposition')
  )

  let extraText = ''
  if (venusAspects.length > 0) {
    const asp = venusAspects[0]
    const otherPlanet = asp.planet1 === '금성' ? asp.planet2 : asp.planet1
    const key = getAspectKey('금성', otherPlanet)
    const template = NEGATIVE_ASPECTS[key]
    if (template) {
      extraText = '\n\n' + template.body
    }
  }

  return {
    id: 'love',
    title: '사랑과 관계의 방정식',
    subtitle: LOVE_SUBTITLE[venus.sign],
    starMovement: `연애와 관계를 주관하는 금성이 ${venus.sign}에, 그리고 ${house?.area || `${venus.house}하우스`}인 ${venus.house}하우스에 머물고 있습니다.`,
    body: text + extraText,
  }
}

function generateCareer(chart: ChartData): ReadingSection {
  const mcSign = chart.mc.sign
  const text = MC_IN_SIGN[mcSign] || ''

  // 8하우스 행성 체크 (재물운 보조)
  const house8Planets = Object.entries(chart.planets)
    .filter(([, p]) => p.house === 8)
    .map(([name]) => name)

  let extraText = ''
  if (house8Planets.length > 0) {
    extraText = `\n\n가장 흥미로운 부분은 재물운입니다. ` +
      `타인의 자산과 투자를 의미하는 8하우스에 ${house8Planets.join(', ')}${iGa(house8Planets[house8Planets.length - 1])} 자리 잡고 있어서, ` +
      `큰돈은 꼬박꼬박 모으는 월급 통장보다는 공동 투자, 펀딩, 혹은 트렌디한 비즈니스를 통해 ` +
      `생각지도 못한 타이밍에 수익을 낼 확률이 높습니다.`
  }

  return {
    id: 'career',
    title: '직업적 성취와 재물의 방향',
    subtitle: CAREER_SUBTITLE[mcSign],
    starMovement: `커리어의 최고점(MC)이 ${mcSign}에 자리 잡고 있습니다.`,
    body: text + extraText,
  }
}

function generateLifeDirection(chart: ChartData): ReadingSection {
  const nn = chart.northNode
  const text = NORTH_NODE_IN_SIGN[nn.sign] || ''
  const house = HOUSE_CONTEXT[nn.house]

  return {
    id: 'lifeDirection',
    title: '삶의 흐름과 다가오는 타이밍',
    subtitle: LIFE_DIRECTION_SUBTITLE[nn.sign],
    starMovement: `이번 생에서 반드시 나아가야 할 진화의 방향을 뜻하는 북교점이 ${nn.sign}에, 그리고 ${house?.area || `${nn.house}하우스`}인 ${nn.house}하우스에 위치하고 있습니다.`,
    body: text,
  }
}

export function generateReading(chart: ChartData, nickname: string): Reading {
  const chartSummary = generateChartSummary(chart, nickname)

  const sections: ReadingSection[] = [
    generateAppearance(chart),
    generateInnerSelf(chart),
    generateCommunication(chart),
    generateStrengths(chart),
    generateChallenges(chart),
    generateLove(chart),
    generateCareer(chart),
    generateLifeDirection(chart),
  ]

  return { chartSummary, sections }
}
