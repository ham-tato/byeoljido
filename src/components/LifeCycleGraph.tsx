const PHASES = [
  {
    start: 0, end: 29,
    label: '씨앗기',
    theme: '나를 만드는 시간',
    desc: '경험과 시행착오를 통해 자아를 형성하는 시기예요. 내가 무엇을 원하는지, 어떤 사람이 될지 탐색하는 과정 자체가 이 시기의 목적이에요. 실수가 많을수록 나중에 더 단단해집니다.',
    color: '#7c6ef0',
  },
  {
    start: 29, end: 42,
    label: '성장기',
    theme: '현실을 구축하는 시간',
    desc: '첫 번째 토성 귀환(29세)을 지나 진짜 어른이 되는 시기예요. 커리어, 관계, 재정 — 실질적인 것들이 자리를 잡아가요. 빠르게 성장하는 만큼 책임도 함께 커지는 시기입니다.',
    color: '#C5A028',
  },
  {
    start: 42, end: 58,
    label: '전환기',
    theme: '진짜 나로 돌아오는 시간',
    desc: '천왕성 대립(42세)을 기점으로 "이게 진짜 내가 원하는 건가?"를 묻게 돼요. 겉에서 안으로, 남의 기대에서 나의 진심으로 향하는 시기예요. 가장 많이 흔들리지만 가장 많이 성장하는 구간이에요.',
    color: '#e2845a',
  },
  {
    start: 58, end: 80,
    label: '완성기',
    theme: '내가 남길 것들',
    desc: '두 번째 토성 귀환(58세) 이후, 지금까지 쌓아온 것들이 빛을 발하는 시기예요. 속도보다 깊이, 성취보다 의미를 추구하게 돼요. 남은 것들을 정리하고, 진짜 내 것만 남기는 시간이에요.',
    color: '#5a9e8e',
  },
]

interface Props {
  birthYear: number
}

export default function LifeCycleGraph({ birthYear }: Props) {
  const currentAge = new Date().getFullYear() - birthYear
  const currentPhase = PHASES.find(p => currentAge >= p.start && currentAge < p.end) || PHASES[PHASES.length - 1]

  return (
    <div className="space-y-0">
      {PHASES.map((phase, i) => {
        const isCurrent = phase.label === currentPhase.label
        return (
          <div
            key={phase.label}
            className="relative pl-5 py-5"
            style={{
              borderLeft: `2px solid ${isCurrent ? phase.color : `${phase.color}30`}`,
              marginLeft: '1px',
            }}
          >
            {/* 타임라인 점 */}
            <div
              className="absolute -left-[5px] top-6 w-2 h-2 rounded-full"
              style={{ background: isCurrent ? phase.color : `${phase.color}50` }}
            />

            {/* 헤더 */}
            <div className="flex items-baseline gap-2 mb-2">
              <span
                className="text-[13px] font-bold"
                style={{ color: isCurrent ? phase.color : `${phase.color}80` }}
              >
                {phase.label}
              </span>
              <span className="text-[11px] text-text-muted/50">
                {phase.end === 80 ? `${phase.start}세~` : `${phase.start}–${phase.end}세`}
              </span>
              {isCurrent && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-1"
                  style={{ background: `${phase.color}20`, color: phase.color, border: `1px solid ${phase.color}50` }}
                >
                  지금 · {currentAge}세
                </span>
              )}
            </div>

            {/* 소제목 */}
            <p
              className="text-[12px] italic mb-2"
              style={{ color: isCurrent ? 'var(--color-text)' : 'var(--color-text-muted)' }}
            >
              — {phase.theme}
            </p>

            {/* 설명 */}
            <p
              className="text-[13px] leading-relaxed"
              style={{ color: isCurrent ? 'rgba(var(--color-text), 0.85)' : 'var(--color-text-muted)', opacity: isCurrent ? 1 : 0.6 }}
            >
              {phase.desc}
            </p>

            {/* 현재 페이즈 하단 구분 */}
            {isCurrent && i < PHASES.length - 1 && (
              <div className="absolute -bottom-px left-0 w-4 h-px" style={{ background: phase.color }} />
            )}
          </div>
        )
      })}
    </div>
  )
}
