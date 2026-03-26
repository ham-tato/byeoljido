import { useNavigate } from 'react-router-dom'

const FEATURES = [
  {
    symbol: '◎',
    title: 'NASA 데이터 기반 엔진',
    body: '당신이 태어나던 순간의 하늘을 가장 정밀하게 복원합니다',
  },
  {
    symbol: '✦',
    title: '점성술의 모든 요소 반영',
    body: '점성술을 구성하는 모든 요소를 섬세하게 엮어내어, 당신이라는 우주를 가장 입체적이고 정확하게 읽어드립니다',
  },
  {
    symbol: '◈',
    title: '개인화된 결과지',
    body: '1,400개 이상의 유형을 분석해 개인 맞춤형 결과지를 제공합니다',
  },
]

// 결정론적 별 위치 (랜덤 없이 일관된 렌더링)
const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  top:     `${(i * 37 + 11) % 97}%`,
  left:    `${(i * 53 + 7) % 97}%`,
  size:    `${(i % 3) + 1}px`,
  opacity: ((i * 17 + 5) % 50) / 100 + 0.08,
  delay:   `${(i * 0.23) % 4}s`,
}))

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="dark-page min-h-screen flex flex-col items-center px-6 pt-20 pb-16 text-center relative overflow-hidden">

      {/* 별 배경 */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {STARS.map(s => (
          <div
            key={s.id}
            className="absolute rounded-full bg-white"
            style={{
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              opacity: s.opacity,
              animation: `nc-breathe ${2.5 + parseFloat(s.delay)}s ease-in-out ${s.delay} infinite`,
            }}
          />
        ))}
        {/* 중앙 금빛 성운 광원 */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(197,160,40,0.07) 0%, transparent 65%)' }}
        />
        {/* 하단 보라 광원 */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(100,60,200,0.12) 0%, transparent 70%)' }}
        />
      </div>

      {/* 브랜드 */}
      <p className="text-[11px] tracking-[0.4em] uppercase text-text-muted font-display mb-16 relative">
        byeoljido
      </p>

      {/* 메인 카피 */}
      <div className="max-w-sm mx-auto mb-12 relative">
        <h1 className="gold-gradient-text text-[2.6rem] leading-[1.3] mb-8" style={{ fontFamily: "'SokchoBadaBatang', serif", fontWeight: 'normal' }}>
          당신이 태어나던 순간<br />
          하늘이 남긴 기록
        </h1>

        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-px bg-gold/40" />
          <span className="text-gold/50 text-xs nc-breathe">✦</span>
          <div className="w-10 h-px bg-gold/40" />
        </div>

        <p className="text-text-muted text-[15px] leading-relaxed">
          별지도는 당신이 태어난 순간의<br />
          하늘을 읽어드립니다.
        </p>
      </div>

      {/* CTA — glassmorphism */}
      <button
        onClick={() => navigate('/intro')}
        className="group relative flex items-center gap-3 px-8 py-4 text-text text-sm tracking-wider transition-all duration-300 font-serif cursor-pointer"
        style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(197,160,40,0.3)',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(197,160,40,0.1)'
          ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(197,160,40,0.6)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'
          ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(197,160,40,0.3)'
        }}
      >
        <span>내 별지도 펼쳐보기</span>
        <span className="text-gold/70 transition-transform duration-300 group-hover:translate-x-1">→</span>
      </button>

      {/* 피처 섹션 */}
      <div className="relative w-full max-w-sm mx-auto mt-20 mb-16 space-y-5">
        {/* 구분선 */}
        <div className="flex items-center gap-3 mb-10">
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(197,160,40,0.3))' }} />
          <span className="text-[10px] tracking-[0.3em] uppercase text-text-muted font-display">Why Byeoljido</span>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(197,160,40,0.3))' }} />
        </div>

        {FEATURES.map((f, i) => (
          <div
            key={i}
            className="flex gap-4 text-left px-5 py-4"
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(197,160,40,0.12)',
            }}
          >
            <span className="text-gold/70 text-xl mt-0.5 shrink-0 leading-none">{f.symbol}</span>
            <div>
              <p className="text-[13px] font-serif text-text mb-1">{f.title}</p>
              <p className="text-[12px] text-text-muted leading-relaxed">{f.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 하단 */}
      <p className="text-[10px] text-text-muted/30 tracking-widest mb-10 relative">
        &copy; 2026 별지도
      </p>
    </div>
  )
}
