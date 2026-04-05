export type PayMethod = 'kakaopay' | 'tosspay'

interface PaywallOverlayProps {
  onPurchase: (method: PayMethod) => void
  loading?: boolean
}

export default function PaywallOverlay({ onPurchase, loading }: PaywallOverlayProps) {
  return (
    <div className="relative mt-8">
      {/* 블러 배경 */}
      <div
        className="select-none pointer-events-none"
        style={{ filter: 'blur(8px)' }}
        aria-hidden
      >
        <p className="text-[15px] text-text/75 leading-[1.9]">
          당신의 별지도에 담긴 이야기가 여기 이어집니다. 태어난 순간의 하늘이 들려주는 메시지를 확인해보세요. 별들의 배치가 말하는 당신만의 고유한 패턴과 흐름이 기다리고 있습니다. 지금 이 순간에도 별들은 당신의 길을 비추고 있습니다.
        </p>
      </div>

      {/* CTA 오버레이 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-gold text-lg font-serif mb-2">✦ 전체 별지도 열기</p>
          <p className="text-text-muted text-sm mb-5">1,900원</p>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => onPurchase('kakaopay')}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded text-sm font-sans cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ background: '#FEE500', color: '#000000CC' }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path fillRule="evenodd" clipRule="evenodd"
                  d="M9 1.5C4.86 1.5 1.5 4.19 1.5 7.5c0 2.08 1.23 3.91 3.09 5.01l-.79 2.94a.28.28 0 0 0 .42.3L7.5 13.8c.49.07.99.1 1.5.1 4.14 0 7.5-2.69 7.5-6S13.14 1.5 9 1.5z"
                  fill="#000000CC"/>
              </svg>
              {loading ? '처리 중...' : '카카오페이'}
            </button>
            <button
              onClick={() => onPurchase('tosspay')}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded text-sm font-sans cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ background: '#0064FF', color: '#FFFFFF' }}
            >
              {loading ? '처리 중...' : '토스페이'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
