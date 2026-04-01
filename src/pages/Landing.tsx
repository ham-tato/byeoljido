import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { initKakao, kakaoLogin, kakaoLogout } from '@/lib/kakao'
import { useAuthStore } from '@/stores/authStore'
import { useChartStore } from '@/stores/chartStore'
import { supabase } from '@/lib/supabase'

const FEATURES = [
  {
    symbol: '◎',
    title: '지금 내 삶의 흐름이 궁금할 때',
    body: '왜 요즘 이런 감정이 드는지, 이 시기에 집중해야 할 게 뭔지 — 별지도가 지금 당신의 주기를 읽어드립니다',
  },
  {
    symbol: '✦',
    title: '나도 몰랐던 내 매력과 약점',
    body: '겉으로 드러나는 모습 너머, 당신이 타고난 강점과 숨겨진 재능 그리고 반복되는 패턴까지 짚어드립니다',
  },
  {
    symbol: '◈',
    title: '사랑과 일, 둘 다 봐드립니다',
    body: '당신의 연애 방식, 끌리는 상대의 유형, 잘 맞는 일의 종류까지 — 1,400개 이상의 유형으로 분석합니다',
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
  const { user, setUser, loadSavedResult, clearUser } = useAuthStore()
  const { setInput, setChart } = useChartStore()
  const [loggingIn, setLoggingIn] = useState(false)
  const [hasSaved, setHasSaved] = useState(false)
  const [loadingPrev, setLoadingPrev] = useState(false)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => { initKakao() }, [])

  // 세션 확인 + OAuth 로그인 완료 시 입력폼으로 이동
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'INITIAL_SESSION') setAuthReady(true)
      if (event === 'SIGNED_IN') navigate('/input')
    })
    return () => subscription.unsubscribe()
  }, [navigate])

  const TEST_ACCOUNT = '510rudwls@naver.com'

  // 로그인 후 저장된 결과 있는지 확인
  useEffect(() => {
    if (!user) { setHasSaved(false); return }
    if (user.email === TEST_ACCOUNT) { setHasSaved(false); return }
    loadSavedResult().then(r => setHasSaved(!!r))
  }, [user]) // eslint-disable-line

  async function handleKakaoLogin() {
    setLoggingIn(true)
    try {
      await kakaoLogin() // 카카오로 리다이렉트 — 이후 코드 실행 안 됨
    } catch (err) {
      console.error('[카카오 로그인 에러]', err)
      setLoggingIn(false)
    }
  }

  async function handleLogout() {
    await kakaoLogout()
    clearUser()
    setHasSaved(false)
  }

  async function handleLoadPrevResult() {
    setLoadingPrev(true)
    const saved = await loadSavedResult()
    setLoadingPrev(false)
    if (!saved) return
    const resultId = Date.now().toString(36)
    sessionStorage.setItem(`byeoljido_result_${resultId}`, JSON.stringify(saved))
    setInput(saved.input)
    setChart(saved.chart)
    navigate(`/result?id=${resultId}`)
  }

  return (
    <div className="dark-page min-h-screen flex flex-col items-center px-6 pt-20 pb-16 text-center relative overflow-hidden">

      {/* 별 배경 */}
      <div className="absolute inset-0" style={{ pointerEvents: 'none' }} aria-hidden>
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
        <h1 className="gold-gradient-text leading-[1.3] mb-8" style={{ fontFamily: "'SokchoBadaBatang', serif", fontWeight: 'normal', fontSize: 'clamp(1.6rem, 7.5vw, 2.6rem)' }}>
          당신이 태어나던 순간,<br />
          별이 그린 지도
        </h1>

        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-px bg-gold/40" />
          <span className="text-gold/50 text-xs nc-breathe">✦</span>
          <div className="w-10 h-px bg-gold/40" />
        </div>

        <p className="text-text-muted text-[15px] leading-relaxed">
          사랑, 재능, 직업, 그리고 지금 당장 해야 할 일까지<br />
          당신의 별지도가 말해주는 모든 것<br />
          <span className="text-gold/60">단돈 1,900원.</span>
        </p>
      </div>

      {/* CTA 버튼 그룹 */}
      <div className="flex flex-col items-center gap-3 relative" style={{ zIndex: 10, minHeight: '60px' }}>

        {/* 로그인 / 이전 결과 */}
        {!authReady ? null : (!user ? (
          <div className="relative" style={{ animation: 'kakao-float 2.8s ease-in-out infinite', position: 'relative', zIndex: 9999 }}>
            {/* 말풍선 "3초!" */}
            <div
              className="absolute -top-7 -left-1 text-[11px] font-bold px-2 py-0.5 rounded-full leading-tight pointer-events-none"
              style={{
                background: 'rgba(197,160,40,0.15)',
                color: '#C5A028',
                border: '1px solid rgba(197,160,40,0.5)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
              }}
            >
              3초!
              {/* 말풍선 꼬리 */}
              <span
                className="absolute left-3 -bottom-1.5"
                style={{
                  width: 0, height: 0,
                  borderLeft: '5px solid transparent',
                  borderRight: '5px solid transparent',
                  borderTop: '6px solid #C5A028',
                  display: 'block',
                }}
              />
            </div>
            <button
              onClick={handleKakaoLogin}
              disabled={loggingIn}
              className="flex items-center gap-2 px-6 py-2.5 rounded text-sm font-sans cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ background: '#FEE500', color: '#000000CC' }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path fillRule="evenodd" clipRule="evenodd"
                  d="M9 1.5C4.86 1.5 1.5 4.19 1.5 7.5c0 2.08 1.23 3.91 3.09 5.01l-.79 2.94a.28.28 0 0 0 .42.3L7.5 13.8c.49.07.99.1 1.5.1 4.14 0 7.5-2.69 7.5-6S13.14 1.5 9 1.5z"
                  fill="#000000CC"/>
              </svg>
              {loggingIn ? '로그인 중...' : '카카오톡으로 로그인하기'}
            </button>
            {/* 로그인 없이 시작 */}
            <button
              onClick={() => navigate('/input')}
              className="text-[12px] text-text-muted/50 hover:text-text-muted/80 transition-colors cursor-pointer font-sans mt-2"
            >
              로그인 없이 시작하기
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            {hasSaved ? (
              <>
                <button
                  onClick={handleLoadPrevResult}
                  disabled={loadingPrev}
                  className="group relative flex items-center gap-3 px-8 py-4 text-text text-sm tracking-wider transition-all duration-300 font-sans cursor-pointer disabled:opacity-50"
                  style={{
                    background: 'rgba(197,160,40,0.12)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(197,160,40,0.4)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(197,160,40,0.2)'
                    ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(197,160,40,0.7)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(197,160,40,0.12)'
                    ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(197,160,40,0.4)'
                  }}
                >
                  <span className="text-gold/80">✦</span>
                  <span>{loadingPrev ? '불러오는 중...' : '내 결과지 불러오기'}</span>
                  <span className="text-gold/70 transition-transform duration-300 group-hover:translate-x-1">→</span>
                </button>
                <button
                  onClick={() => navigate('/input')}
                  className="group relative flex items-center gap-3 px-8 py-4 text-text text-sm tracking-wider transition-all duration-300 font-sans cursor-pointer"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(197,160,40,0.2)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(197,160,40,0.08)'
                    ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(197,160,40,0.5)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'
                    ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(197,160,40,0.2)'
                  }}
                >
                  <span>새로운 별지도 펼쳐보기</span>
                  <span className="text-gold/70 transition-transform duration-300 group-hover:translate-x-1">→</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/input')}
                className="group relative flex items-center gap-3 px-8 py-4 text-text text-sm tracking-wider transition-all duration-300 font-sans cursor-pointer"
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
            )}
            <button
              onClick={handleLogout}
              className="text-[11px] text-text-muted/40 hover:text-text-muted/70 transition-colors cursor-pointer font-sans"
            >
              로그아웃
            </button>
          </div>
        ))}
      </div>

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
              <p className="text-[13px] font-sans font-bold text-text mb-1">{f.title}</p>
              <p className="text-[12px] text-text-muted leading-relaxed">{f.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 하단 */}
      <div className="flex flex-col items-center gap-2 mb-10 relative">
        <div className="flex items-center gap-4">
          <Link to="/terms" className="text-[11px] text-text-muted/40 hover:text-text-muted/70 transition-colors">
            이용약관
          </Link>
          <span className="text-text-muted/20 text-[11px]">|</span>
          <Link to="/privacy" className="text-[11px] text-text-muted/40 hover:text-text-muted/70 transition-colors">
            개인정보처리방침
          </Link>
        </div>
        <p className="text-[10px] text-text-muted/30 tracking-widest">
          &copy; 2026 별지도
        </p>
      </div>
    </div>
  )
}
