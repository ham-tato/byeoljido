import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import type { PayMethod } from '@/lib/payment'

export default function Payment() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handlePay(method: PayMethod) {
    if (!code) return
    setLoading(true)
    setError('')

    try {
      const { requestPayment } = await import('@/lib/payment')
      const paymentId = await requestPayment(code, method)
      if (!paymentId) {
        setLoading(false)
        return // 사용자가 결제 취소
      }

      // 서버 검증
      const res = await fetch('/api/payment/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, paymentId }),
      })

      if (!res.ok) throw new Error('결제 검증 실패')

      // 결제 완료 → 결과 페이지로 이동
      navigate(`/result/${code}`, { replace: true })
    } catch (err) {
      console.error('결제 오류:', err)
      setError('결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.')
      setLoading(false)
    }
  }

  return (
    <div className="dark-page min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">

        {/* 상단 장식 */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-8 h-px bg-gold/40" />
          <span className="text-gold/50 text-xs">✦</span>
          <div className="w-8 h-px bg-gold/40" />
        </div>

        <h1 className="text-2xl font-serif text-text mb-3">전체 별지도 열기</h1>
        <p className="text-text-muted text-sm mb-2">
          사랑, 재능, 직업, 삶의 방향까지
        </p>
        <p className="text-text-muted text-sm mb-8">
          당신의 별지도가 말해주는 모든 것
        </p>

        {/* 가격 */}
        <div className="mb-10">
          <span className="text-3xl font-serif text-gold">1,900</span>
          <span className="text-gold/70 text-sm ml-1">원</span>
        </div>

        {/* 포함 내용 */}
        <div className="text-left mb-10 space-y-3 px-4">
          {[
            '타고난 기본 성향 (겉모습·내면·소통)',
            '빛과 그림자 (강점·숨겨진 재능·도전)',
            '사랑과 운명 (연애 방식·운명의 상대)',
            '항해의 방향 (직업·인생 사이클)',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-gold/70 text-xs mt-0.5 shrink-0">✦</span>
              <span className="text-[13px] text-text-muted leading-relaxed">{item}</span>
            </div>
          ))}
        </div>

        {/* 결제 수단 */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handlePay('kakaopay')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-lg text-sm font-sans cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ background: '#FEE500', color: '#000000CC' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path fillRule="evenodd" clipRule="evenodd"
                d="M9 1.5C4.86 1.5 1.5 4.19 1.5 7.5c0 2.08 1.23 3.91 3.09 5.01l-.79 2.94a.28.28 0 0 0 .42.3L7.5 13.8c.49.07.99.1 1.5.1 4.14 0 7.5-2.69 7.5-6S13.14 1.5 9 1.5z"
                fill="#000000CC"/>
            </svg>
            {loading ? '결제 처리 중...' : '카카오페이로 결제'}
          </button>

          <button
            onClick={() => handlePay('tosspay')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-lg text-sm font-sans cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ background: '#0064FF', color: '#FFFFFF' }}
          >
            {loading ? '결제 처리 중...' : '토스페이로 결제'}
          </button>
        </div>

        {error && (
          <p className="text-red-400 text-sm mb-4">{error}</p>
        )}

        {/* 돌아가기 */}
        <Link
          to={`/result/${code}`}
          className="text-[12px] text-text-muted/50 hover:text-text-muted/80 transition-colors"
        >
          ← 결과 미리보기로 돌아가기
        </Link>

        {/* 하단 안내 */}
        <div className="mt-12">
          <p className="text-[10px] text-text-muted/30 leading-relaxed">
            결제 완료 후 즉시 전체 내용을 확인하실 수 있습니다.<br />
            디지털 콘텐츠 특성상 열람 후 환불이 불가합니다.
          </p>
        </div>
      </div>
    </div>
  )
}
