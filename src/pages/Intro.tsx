import { useNavigate } from 'react-router-dom'

const PARAGRAPHS = [
  '사람이 이 세상에 처음 숨을 들이쉬던 그 순간,\n하늘의 별들은 저마다 특정한 자리에 있었습니다.',
  '태양이 어느 별자리에 있었는지,\n달은 어디에 떠 있었는지,\n동쪽 지평선에 어떤 별이 막 올라오고 있었는지 —\n그 배치가 곧 당신이라는 사람의 설계도입니다.',
  '이것을 별지도라고 합니다.\n\n점성술은 운명을 예언하지 않습니다.\n다만 당신이 어떤 방식으로 세상을 느끼고,\n어떤 방식으로 사람을 사랑하며,\n어떤 방식으로 자신을 드러내는지를\n하늘의 언어로 풀어냅니다.',
  '지금 당신의 별지도를\n함께 펼쳐보겠습니다.',
]

export default function Intro() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-md mx-auto w-full px-8 pt-24 pb-16">

        {/* 상단 장식 */}
        <div className="flex items-center gap-3 mb-16">
          <div className="w-6 h-px bg-gold/50" />
          <span className="text-gold/50 text-[10px]">✦</span>
          <p className="text-[10px] tracking-[0.3em] uppercase text-text-muted/50 font-display">
            별지도란
          </p>
        </div>

        {/* 본문 */}
        <div className="space-y-10">
          {PARAGRAPHS.map((para, i) => (
            <p
              key={i}
              className="font-serif text-[17px] leading-[2] text-text/80 whitespace-pre-line"
              style={{ letterSpacing: '0.01em' }}
            >
              {para}
            </p>
          ))}
        </div>

        {/* 구분선 */}
        <div className="flex items-center gap-3 my-16">
          <div className="flex-1 h-px bg-border" />
          <span className="text-gold/40 text-xs">✦</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="font-serif text-text-muted text-sm mb-8 leading-relaxed">
            생년월일시와 출생지를 알려주시면<br />
            당신만의 별지도를 읽어드립니다.
          </p>

          <button
            onClick={() => navigate('/input')}
            className="w-full py-4 bg-text text-bg font-serif text-base tracking-wider hover:opacity-80 transition-opacity cursor-pointer"
          >
            내 정보 입력하기
          </button>

          <button
            onClick={() => navigate('/')}
            className="mt-4 text-[12px] text-text-muted/40 hover:text-text-muted/70 transition-colors cursor-pointer"
          >
            ← 돌아가기
          </button>
        </div>

      </main>

      <footer className="text-center py-6 text-text-muted/30 text-[10px] tracking-widest">
        &copy; 2026 별지도
      </footer>
    </div>
  )
}
