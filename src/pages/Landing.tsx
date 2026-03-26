import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">

      {/* 배경 장식 */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(197,160,40,0.04) 0%, transparent 70%)' }} />
      </div>

      {/* 브랜드 */}
      <p className="text-[11px] tracking-[0.4em] uppercase text-text-muted/60 font-display mb-16">
        byeoljido
      </p>

      {/* 메인 카피 */}
      <div className="max-w-sm mx-auto mb-12">
        <h1 className="font-serif text-[2.6rem] leading-[1.25] text-text mb-8">
          태어나던 순간,<br />
          하늘이 남긴 기록
        </h1>

        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-px bg-gold/50" />
          <span className="text-gold/60 text-xs">✦</span>
          <div className="w-10 h-px bg-gold/50" />
        </div>

        <p className="text-text-muted text-[15px] leading-relaxed">
          별지도는 당신이 태어난 순간의<br />
          하늘을 읽어드립니다.
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={() => navigate('/intro')}
        className="group flex items-center gap-3 px-8 py-4 border border-text/20 hover:border-gold/60 text-text text-sm tracking-wider transition-all duration-300 font-serif cursor-pointer"
      >
        <span>내 별지도가 궁금하다면</span>
        <span className="text-gold/70 transition-transform duration-300 group-hover:translate-x-1">→</span>
      </button>

      {/* 하단 */}
      <p className="absolute bottom-8 text-[10px] text-text-muted/30 tracking-widest">
        &copy; 2026 별지도
      </p>
    </div>
  )
}
