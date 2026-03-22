import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="mb-6">
          <div className="text-5xl mb-4" role="img" aria-label="stars">
            &#10024;
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-text mb-3 leading-tight">
            당신이 태어나던 순간,<br />하늘은 어떤 그림을<br />그리고 있었을까요?
          </h1>
          <p className="text-text-muted text-base md:text-lg max-w-md mx-auto leading-relaxed">
            생년월일시와 출생지만으로<br />
            당신만의 점성술 분석 리포트를 만들어드립니다.
          </p>
        </div>

        <button
          onClick={() => navigate('/input')}
          className="px-8 py-4 bg-primary hover:bg-primary-dark text-white text-lg font-medium rounded-xl transition-colors shadow-lg shadow-primary/20 cursor-pointer"
        >
          내 별지도 보기
        </button>

        <p className="text-text-muted/60 text-xs mt-4">1,900원 · 평생 열람 가능</p>
      </section>

      {/* 특징 */}
      <section className="px-4 pb-16">
        <div className="max-w-lg mx-auto grid gap-6">
          <FeatureCard
            icon="&#9734;"
            title="정밀한 천문 데이터"
            desc="NASA JPL 기반 Swiss Ephemeris 엔진으로 태어난 순간의 정확한 행성 배치를 계산합니다."
          />
          <FeatureCard
            icon="&#128214;"
            title="8가지 심층 분석"
            desc="겉모습, 내면, 소통 방식, 장점, 과제, 사랑, 직업, 삶의 방향까지 총 8개 섹션의 상세한 분석을 제공합니다."
          />
          <FeatureCard
            icon="&#127760;"
            title="전세계 출생지 지원"
            desc="한국은 물론 전세계 모든 도시의 위도·경도를 자동으로 반영합니다."
          />
        </div>
      </section>

      {/* 푸터 */}
      <footer className="text-center py-6 text-text-muted/40 text-xs border-t border-border/30">
        &copy; 2026 별지도. All rights reserved.
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="bg-bg-card rounded-xl p-5 border border-border/50">
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className="font-bold text-text mb-1">{title}</h3>
      <p className="text-text-muted text-sm leading-relaxed">{desc}</p>
    </div>
  )
}
