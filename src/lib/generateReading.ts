import type { ChartData } from '@/stores/chartStore'
import { SIGN_ELEMENT, ASCENDANT_IN_SIGN, MOON_IN_SIGN, MERCURY_IN_SIGN } from '@/data/templates/signs'
import { VENUS_IN_SIGN } from '@/data/templates/venus'
import { MC_IN_SIGN } from '@/data/templates/career'
import { POSITIVE_ASPECTS, NEGATIVE_ASPECTS, getAspectKey } from '@/data/templates/aspects'
import { NORTH_NODE_IN_SIGN } from '@/data/templates/northNode'
import { HOUSE_CONTEXT } from '@/data/templates/houses'
import { JUPITER_IN_SIGN } from '@/data/templates/jupiter'
import { DESCENDANT_MAP, DESTINED_PARTNER } from '@/data/templates/descendant'
import { APPEARANCE_SUBTITLE, INNER_SUBTITLE, COMMUNICATION_SUBTITLE, LOVE_SUBTITLE, CAREER_SUBTITLE, LIFE_DIRECTION_SUBTITLE, JUPITER_SUBTITLE, DESTINED_PARTNER_SUBTITLE } from '@/data/templates/subtitles'
import { eulReul, iGa, gwaWa } from '@/lib/particles'

const PLANET_SYMBOLS: Record<string, string> = {
  '태양': '☉', '달': '☽', '수성': '☿', '금성': '♀', '화성': '♂',
  '목성': '♃', '토성': '♄', '천왕성': '♅', '해왕성': '♆', '명왕성': '♇',
}

export interface StarBadge {
  symbol: string  // 천문 기호
  label: string   // 행성/포인트 이름
  sign: string    // 별자리
  house?: number  // 하우스
}

export interface ReadingSection {
  id: string
  title: string
  subtitle?: string
  badges?: StarBadge[]
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

// 태양+달 원소 조합 → "이거 나잖아" 포인트
const SUN_MOON_HIT: Record<string, string> = {
  '불-불': '겉도 속도 뜨겁고, 꽂히면 폭발적으로 달려드는 타입이에요. 다만 "나 왜 이렇게 쉽게 질리지?"라는 생각을 혼자 몇 번 해봤을 거예요. 열정이 빠르게 치솟는 만큼 식는 속도도 빠르거든요.',
  '불-물': '친구들은 잘 모르지만, 당신 혼자 옛날 기억 떠올리다 울컥하는 날이 생각보다 많아요. 겉으로는 앞만 보고 달리는 사람인데, 안에서는 감수성이 조용히 넘쳐흐르는 모순이 공존하고 있어요.',
  '불-흙': '충동적으로 시작해 놓고 막상 닥치면 "이거 되긴 할까" 걱정이 몰려오는 패턴, 익숙하지 않나요? 행동은 빠른데 내면은 의외로 신중하고 안정을 원해요.',
  '불-바람': '머리와 몸이 동시에 달리는 타입이에요. 아이디어도 많고 추진력도 있는데, 정작 중요한 것 하나를 끝까지 마무리하는 게 생각보다 어렵게 느껴질 거예요.',
  '물-불': '겉으로는 참는데 안에서는 이미 끓고 있는 상태. "왜 말 못 하고 혼자 끙끙 앓다가 나중에 폭발하지"라는 패턴을 스스로도 이미 알고 있을 거예요.',
  '물-물': '공감 능력이 너무 뛰어나서 주변 사람의 에너지에 크게 영향받아요. 에너지 드레인 당한 날엔 아무것도 하기 싫어지는 게 당연한 반응이에요. 혼자 있는 시간이 필수인 이유가 여기 있어요.',
  '물-흙': '감성적으로 보이지만 사실 현실적인 거 엄청 따지는 편이에요. "이 사람 믿어도 되나?" 판단할 때 감정보다 행동 패턴을 더 오래 관찰하는 스타일이에요.',
  '물-바람': '"이 감정이 맞는 건가?" 계속 머리로 따져보다가 정작 감정을 즐기지 못하는 경우가 생겨요. 이성과 감정이 자주 충돌하는 게 이 배치의 특징이에요.',
  '흙-불': '겉은 침착하고 신중한데 속에는 의외의 열정과 야망이 있어요. 천천히 가는 것처럼 보이지만 실제로는 내면에서 빠르게 달리고 싶은 충동을 꾹 눌러두고 있어요.',
  '흙-물': '남들한테는 "너 되게 강하고 현실적인 사람이다"라는 말을 자주 듣지만, 실제로는 사소한 말 한마디에 꽤 깊이 상처받는 편이에요. 그걸 티 안 내는 것뿐이에요.',
  '흙-흙': '리스크 있는 선택 앞에서 "그래도 이건 좀 아니지 않아?"라며 몇 번이고 재고하는 신중파예요. 느리게 보여도 한번 결정하면 끝까지 가는 사람이에요.',
  '흙-바람': '안정을 원하면서도 같은 것이 반복되면 지루해지는 묘한 딜레마를 안고 살아요. "변화는 싫은데 지금 이대로도 좀 답답해"라는 감각이 익숙할 거예요.',
  '바람-불': '"시작은 잘 하는데 왜 끝은 항상 흐지부지"라는 패턴이 반복되는 편이에요. 아이디어와 열정은 넘치는데, 마무리 단계에서 에너지가 다른 곳으로 흩어지거든요.',
  '바람-물': '"이건 논리적으로 맞는데 왜 기분이 이상하지"라는 내적 갈등이 익숙할 거예요. 이성으로 판단하려 해도 감정이 자꾸 끼어드는 구조예요.',
  '바람-흙': '겉으로는 자유롭고 독립적으로 보이지만, 실제로는 확실하고 믿을 수 있는 것에 강하게 끌리는 편이에요. 불안정한 상황을 겉으론 쿨하게 대응하면서 속으로는 꽤 신경 쓰거든요.',
  '바람-바람': '생각이 너무 많아서 "이래도 되나 저래도 되나" 하다가 결정을 못 내리거나, 내리고 나서도 "이게 맞나" 계속 되짚어보는 경우가 있어요. 머릿속이 항상 과부하 상태예요.',
}

// 별자리별 외면/내면 페르소나 (한 줄 요약용)
const SIGN_PERSONA: Record<string, { outer: string; inner: string }> = {
  '양자리':    { outer: '선두주자',    inner: '충동적 개척자'  },
  '황소자리':  { outer: '안정형 현실주의자', inner: '소유욕 강한 감각주의자' },
  '쌍둥이자리':{ outer: '멀티플레이어', inner: '정보 수집형 변신가' },
  '게자리':    { outer: '공감형 보호자', inner: '감수성 심한 집착가' },
  '사자자리':  { outer: '주인공 아우라', inner: '인정 욕구 강한 카리스마' },
  '처녀자리':  { outer: '분석형 완벽주의자', inner: '불안 기반 통제자' },
  '천칭자리':  { outer: '외교관',       inner: '갈등 회피형 균형주의자' },
  '전갈자리':  { outer: '심해형 전략가', inner: '집착과 통찰의 소유자' },
  '사수자리':  { outer: '자유인',       inner: '회피형 모험가'  },
  '염소자리':  { outer: '야망형 전략가', inner: '통제 욕구 강한 현실주의자' },
  '물병자리':  { outer: '아웃사이더 혁신가', inner: '감정 차단형 관찰자' },
  '물고기자리':{ outer: '몽상가',       inner: '경계 없는 공감자' },
}

function generateChartSummary(chart: ChartData, nickname: string): { title: string; body: string } {
  const sunSign  = chart.planets['태양']?.sign || '양자리'
  const moonSign = chart.planets['달']?.sign   || '양자리'
  const ascSign  = chart.ascendant.sign

  const sun  = getElementMetaphor(sunSign)
  const moon = getElementMetaphor(moonSign)
  const asc  = getElementMetaphor(ascSign)

  const ascPersona  = SIGN_PERSONA[ascSign]?.outer  || ascSign
  const sunPersona  = SIGN_PERSONA[sunSign]?.inner  || sunSign
  const moonPersona = SIGN_PERSONA[moonSign]?.inner || moonSign

  // 한 줄 요약: 상승(겉) vs 태양/달(속) 대비
  let title: string
  if (ascSign === sunSign) {
    title = `겉도 속도 ${ascPersona}, 내면 깊이는 ${moonPersona}`
  } else {
    title = `${ascPersona}의 가면, 본질은 ${sunPersona}`
  }

  const sunMoonKey = `${sun.element}-${moon.element}`
  const hitPoint = SUN_MOON_HIT[sunMoonKey] || ''

  const body =
    `${nickname}님이 태어난 날, 하늘의 별들은 아주 특별한 그림을 그리고 있었어요. ` +
    `가장 중요한 자아를 뜻하는 **태양**은 ${sun.metaphor}의 기운을 가진 **${sunSign}**에 머물렀어요. ` +
    `이 배치 덕분에 ${nickname}님은 **${sun.keyword}**${eulReul(sun.keyword)} 타고났죠. ` +
    `동시에 첫인상을 결정하는 동쪽 지평선에는 ${asc.metaphor} 같은 **${ascSign}**${iGa(ascSign)} 자리하고 있었어요.\n\n` +
    `여기에 깊은 내면을 상징하는 **달**은 ${moon.metaphor}의 기운을 가진 **${moonSign}**에 머물고 있었네요. ` +
    `정리하면, ${nickname}님은 겉으로는 **${asc.keyword}**${eulReul(asc.keyword)} 보여주면서, ` +
    `중심에는 **${sun.keyword}**${iGa(sun.keyword)} 단단하게 자리 잡고, ` +
    `내면 깊은 곳에서는 **${moon.keyword}**${iGa(moon.keyword)} 조용히 흐르는 사람이에요.` +
    (hitPoint ? `\n\n${hitPoint}` : '')

  return { title, body }
}

function generateAppearance(chart: ChartData): ReadingSection {
  const ascSign = chart.ascendant.sign
  const text = ASCENDANT_IN_SIGN[ascSign] || ''

  return {
    id: 'appearance',
    title: '남이 보는 나',
    subtitle: APPEARANCE_SUBTITLE[ascSign],
    badges: [{ symbol: 'ASC', label: '상승궁', sign: ascSign }],
    starMovement: `당신의 첫인상과 사회적 가면을 뜻하는 상승궁이 ${ascSign}에 위치해 있습니다.`,
    body: text,
  }
}

function generateInnerSelf(chart: ChartData): ReadingSection {
  const moon = chart.planets['달']
  if (!moon) return { id: 'inner', title: '나의 숨겨진 내면', starMovement: '달의 위치를 계산할 수 없습니다.', body: '출생 시간을 정확히 입력하면 더 정확한 분석이 가능합니다.' }

  const house = HOUSE_CONTEXT[moon.house]
  const text = MOON_IN_SIGN[moon.sign] || ''

  return {
    id: 'inner',
    title: '나의 숨겨진 내면',
    subtitle: INNER_SUBTITLE[moon.sign],
    badges: [{ symbol: '☽', label: '달', sign: moon.sign, house: moon.house }],
    starMovement: `무의식과 감정을 상징하는 달이 ${moon.sign}에, ${house?.description || `${moon.house}하우스에 위치해 있습니다.`}`,
    body: text,
  }
}

function generateCommunication(chart: ChartData): ReadingSection {
  const mercury = chart.planets['수성']
  if (!mercury) return { id: 'communication', title: '내가 세상과 소통하는 방식', starMovement: '수성의 위치를 계산할 수 없습니다.', body: '출생 시간을 정확히 입력하면 더 정확한 분석이 가능합니다.' }

  const house = HOUSE_CONTEXT[mercury.house]
  const text = MERCURY_IN_SIGN[mercury.sign] || ''

  return {
    id: 'communication',
    title: '내가 세상과 소통하는 방식',
    subtitle: COMMUNICATION_SUBTITLE[mercury.sign],
    badges: [{ symbol: '☿', label: '수성', sign: mercury.sign, house: mercury.house }],
    starMovement: `소통과 사고방식을 뜻하는 수성이 ${mercury.sign} ${mercury.house}하우스에 자리 잡고 있습니다.`,
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
      const p1 = chart.planets[aspect.planet1]
      const p2 = chart.planets[aspect.planet2]
      return {
        id: 'strengths',
        title: '빛을 발하는 장점과 나만의 매력',
        subtitle: template.title,
        badges: [
          { symbol: PLANET_SYMBOLS[aspect.planet1] || '★', label: aspect.planet1, sign: p1?.sign || '', house: p1?.house },
          { symbol: PLANET_SYMBOLS[aspect.planet2] || '★', label: aspect.planet2, sign: p2?.sign || '', house: p2?.house },
        ],
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
      const p1 = chart.planets[aspect.planet1]
      const p2 = chart.planets[aspect.planet2]
      return {
        id: 'challenges',
        title: '마주해야 할 과제와 성장의 열쇠',
        subtitle: template.title,
        badges: [
          { symbol: PLANET_SYMBOLS[aspect.planet1] || '★', label: aspect.planet1, sign: p1?.sign || '', house: p1?.house },
          { symbol: PLANET_SYMBOLS[aspect.planet2] || '★', label: aspect.planet2, sign: p2?.sign || '', house: p2?.house },
        ],
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

  return {
    id: 'love',
    title: '사랑과 관계의 방정식',
    subtitle: LOVE_SUBTITLE[venus.sign],
    badges: [{ symbol: '♀', label: '금성', sign: venus.sign, house: venus.house }],
    starMovement: `연애와 관계를 주관하는 금성이 ${venus.sign}에, 그리고 ${house?.area || `${venus.house}하우스`}인 ${venus.house}하우스에 머물고 있습니다.`,
    body: text,
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
    badges: [{ symbol: 'MC', label: '중천', sign: mcSign }],
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
    badges: [{ symbol: '☊', label: '북교점', sign: nn.sign, house: nn.house }],
    starMovement: `이번 생에서 반드시 나아가야 할 진화의 방향을 뜻하는 북교점이 ${nn.sign}에, 그리고 ${house?.area || `${nn.house}하우스`}인 ${nn.house}하우스에 위치하고 있습니다.`,
    body: text,
  }
}

function generateHiddenTalent(chart: ChartData): ReadingSection {
  const jupiter = chart.planets['목성']
  if (!jupiter) return { id: 'hiddenTalent', title: '숨겨진 재능과 행운의 열쇠', starMovement: '목성의 위치를 계산할 수 없습니다.', body: '출생 시간을 정확히 입력하면 더 정확한 분석이 가능합니다.' }

  const house = HOUSE_CONTEXT[jupiter.house]
  const text = JUPITER_IN_SIGN[jupiter.sign] || ''

  return {
    id: 'hiddenTalent',
    title: '숨겨진 재능과 행운의 열쇠',
    subtitle: JUPITER_SUBTITLE[jupiter.sign],
    badges: [{ symbol: '♃', label: '목성', sign: jupiter.sign, house: jupiter.house }],
    starMovement: `확장과 행운의 별 목성이 ${jupiter.sign}에, 그리고 ${house?.area || `${jupiter.house}하우스`}인 ${jupiter.house}하우스에 자리 잡고 있습니다.`,
    body: text,
  }
}

function generateDestinedPartner(chart: ChartData): ReadingSection {
  const ascSign = chart.ascendant.sign
  const descSign = DESCENDANT_MAP[ascSign] || '천칭자리'
  const text = DESTINED_PARTNER[descSign] || ''

  return {
    id: 'destinedPartner',
    title: '내 운명의 상대',
    subtitle: DESTINED_PARTNER_SUBTITLE[descSign],
    badges: [{ symbol: 'DSC', label: '디센던트', sign: descSign }],
    starMovement: `당신의 관계와 파트너십을 뜻하는 디센던트(7하우스)${iGa(descSign)} ${descSign}에 위치해 있습니다. 이는 상승궁 ${ascSign}의 정반대 에너지로, 당신에게 부족한 것을 채워줄 운명의 상대를 가리킵니다.`,
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
    generateHiddenTalent(chart),
    generateLove(chart),
    generateDestinedPartner(chart),
    generateCareer(chart),
    generateLifeDirection(chart),
  ]

  return { chartSummary, sections }
}
