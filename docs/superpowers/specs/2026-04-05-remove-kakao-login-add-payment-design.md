# 별지도 — 카카오 로그인 제거 + 비회원 결제 + 고유링크 공유

## 개요

카카오 로그인을 전면 제거하고, 비회원 상태에서 결제 및 결과 열람이 가능하도록 전환한다.
결과마다 고유 짧은 코드를 발급하여 공유 링크로 사용한다.
사업자 정보를 숨숨 → 하우워즈로 교체하고, 약관/개인정보처리방침을 서비스 성격에 맞게 재작성한다.

## 1. 카카오 로그인 제거

### 삭제 파일
- `src/lib/kakao.ts`
- `src/stores/authStore.ts`

### 수정 파일
- `src/lib/supabase.ts` — Auth 관련 코드 제거, DB 클라이언트만 유지
- `src/pages/Landing.tsx` — 카카오 로그인/로그아웃/이전 결과 불러오기 제거
- `src/pages/InputForm.tsx` — authStore 의존성 제거
- `src/pages/Result.tsx` — authStore 의존성 제거, saveResult 제거

### Landing.tsx CTA 변경
- 로그인 버튼 제거
- "내 별지도 펼쳐보기" 버튼 하나로 단순화 → `/input`으로 이동
- "로그인 없이 시작하기" 버튼도 불필요 → 제거

## 2. 결과 저장 & 고유링크

### Supabase `results` 테이블 스키마

```sql
-- 기존 테이블 drop 후 재생성 (또는 마이그레이션)
create table results (
  id text primary key,            -- 랜덤 6~8자 코드 (예: a3xK7m)
  input jsonb not null,           -- BirthInput
  chart jsonb not null,           -- ChartData
  paid boolean default false,
  payment_id text,                -- PortOne 결제 ID
  created_at timestamptz default now()
);

-- RLS: Cloudflare Function의 service_role key로만 접근
alter table results enable row level security;
-- anon key로는 직접 접근 불가
```

### 고유 코드 생성
- `nanoid` 또는 직접 구현 (base62, 6자)
- 충돌 확인: insert 시 unique constraint에 의존

### 흐름
```
InputForm → calculateChart() → Supabase insert (id: 랜덤코드, paid: false)
         → navigate('/result/{code}')
```

### 라우팅 변경
- 기존: `/result?id=xxx` (sessionStorage 기반)
- 변경: `/result/:code` (Supabase 기반)
- 기존 `?d=base64(input)` 공유 링크는 제거 (고유링크로 대체)

## 3. 유료 잠금 (블러 + CTA)

### 무료 범위
- 각 섹션(프롤로그, 제1장~제4장, 에필로그)의 **첫 문장만** 노출

### 잠금 표현
- 첫 문장 이후 영역: `blur(8px)` + `user-select: none`
- 블러 영역 위 CTA 오버레이: "1,900원에 전체 별지도 열기" 버튼
- 결제 수단 선택: 카카오페이 / 토스페이

### 보안 (서버 검증 방식)
- **미결제 시**: Cloudflare Function(`GET /api/result/:code`)이 각 섹션 첫 문장만 반환
- **결제 완료 시**: 전체 reading 데이터 반환
- 프론트에서 Supabase 직접 조회하지 않음 → chart 데이터 클라이언트 노출 방지

### 결과 조회 API 설계

```
GET /api/result/:code

응답 (미결제):
{
  "paid": false,
  "input": { nickname, year, month, day, ... },
  "preview": [
    { "chapter": "prologue", "title": "...", "firstSentence": "..." },
    { "chapter": "part1", "title": "타고난 기본 성향", "sections": [
      { "subtitle": "겉모습", "firstSentence": "..." },
      { "subtitle": "내면", "firstSentence": "..." },
      ...
    ]},
    ...
  ]
}

응답 (결제 완료):
{
  "paid": true,
  "input": { ... },
  "reading": [ /* 전체 ReadingSection[] */ ]
}
```

이를 위해 `generateReading()` 로직을 Cloudflare Function에서 실행해야 한다.
→ `src/lib/generateReading.ts`를 서버에서도 사용 가능하도록 functions 디렉토리에 복사 또는 공유 구조로 변경.

## 4. 결제 흐름

### 기술 스택
- PortOne SDK v2 (`@portone/browser-sdk`)
- 결제 수단: 카카오페이, 토스페이

### 클라이언트 흐름
```
CTA 버튼 클릭
  → 결제 수단 선택 (카카오페이 / 토스페이)
  → PortOne SDK requestPayment()
  → 결제 완료 후 paymentId 획득
  → POST /api/payment/complete { code, paymentId }
  → 응답 성공 시 → GET /api/result/:code (전체 데이터)
  → 페이지 업데이트 (블러 해제)
```

### 서버 검증 (Cloudflare Function)
```
POST /api/payment/complete

1. paymentId로 PortOne API 호출 → 실제 결제 확인
2. 금액 1,900원 검증
3. Supabase results 테이블 → paid: true, payment_id 저장
4. 응답: { success: true }
```

### PortOne 설정
- Store ID: lovetype과 동일한 하우워즈 계정 사용 (또는 별도 채널 추가)
- Payment ID 형식: `byeoljido-{code}-{timestamp}`

## 5. 공유

- 고유링크: `https://byeoljido.kr/result/{code}`
- Web Share API 지원 시 네이티브 공유, 미지원 시 클립보드 복사
- 공유 받은 사람도 동일 페이지 접근 → 미결제면 블러, 결제자만 전체 열람
- 결제는 결과 코드 단위 (1회 결제 = 해당 결과 영구 열람)

## 6. 사업자 정보 교체

### 변경 대상 파일
- `src/pages/Terms.tsx`
- `src/pages/Privacy.tsx`
- `src/pages/Landing.tsx` (푸터에 사업자 정보 추가)

### 교체 내용

| 항목 | 변경 후 |
|---|---|
| 상호 | 하우워즈 |
| 대표자 | 송산해 |
| 사업자등록번호 | 413-24-01458 |
| 통신판매업 신고번호 | 제 2023-서울강남-01292호 |
| 주소 | 서울특별시 금천구 디지털로10길 78, 941-77호(가산동, 가산테라타워) |
| 고객센터 | contact@questionperday.me |
| 개인정보보호책임자 | 송산해 |

### 이용약관 주요 변경
- 카카오 로그인 관련 조항(외부계정 로그인) 삭제
- 서비스 성격: "점성술 기반 콘텐츠"로 명시 (심리검사/임상진단 아님)
- 환불 정책: 디지털 콘텐츠, 열람 후 환불 불가 / 시스템 오류 시 7일 이내 환불

### 개인정보처리방침 주요 변경
- 카카오 로그인 수집 항목 삭제
- 수집 항목: 결제 시 거래정보(PortOne 통해), 자동 생성 정보(접속로그, IP 등)
- 출생 정보(생년월일시, 출생지)는 결과 생성용으로 서버 저장됨을 명시
- 위탁: 결제 처리(PortOne), 서버 호스팅(Supabase, Cloudflare)

### Landing.tsx 푸터
- 기존: 이용약관 | 개인정보처리방침 + 저작권만
- 변경: 사업자 정보 블록 추가 (lovetype 푸터 패턴 참고)

## 7. 파일 구조 변경 요약

### 삭제
```
src/lib/kakao.ts
src/stores/authStore.ts
```

### 수정
```
src/App.tsx                    — 라우트 /result/:code
src/lib/supabase.ts            — Auth 제거
src/pages/Landing.tsx          — 로그인 제거, CTA 단순화, 푸터 사업자 정보
src/pages/InputForm.tsx        — Supabase insert, authStore 제거
src/pages/Result.tsx           — API 조회, 블러/CTA, 결제 UI, 공유
src/pages/Terms.tsx            — 하우워즈 정보, 카카오 조항 제거
src/pages/Privacy.tsx          — 하우워즈 정보, 수집 항목 변경
```

### 신규
```
functions/api/result/[code].ts     — 결과 조회 (미결제: 미리보기, 결제: 전체)
functions/api/payment/complete.ts  — PortOne 결제 검증 + Supabase 업데이트
src/lib/payment.ts                 — PortOne SDK 래퍼 (requestPayment)
src/components/PaywallOverlay.tsx  — 블러 + CTA 오버레이 컴포넌트
wrangler.toml                      — Cloudflare Functions 설정
```

### 패키지 추가
```
@portone/browser-sdk    — 결제 SDK
nanoid                  — 고유 코드 생성
```

## 8. 환경 변수

### 프론트엔드 (.env / Cloudflare 대시보드)
```
VITE_SUPABASE_URL=https://uikchwmbortfpncjnipk.supabase.co
VITE_SUPABASE_ANON_KEY=...
VITE_PORTONE_STORE_ID=...
```

### Cloudflare Functions (wrangler.toml secrets)
```
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...       # service_role key (RLS 우회)
PORTONE_API_SECRET=...          # PortOne V2 API secret
```
