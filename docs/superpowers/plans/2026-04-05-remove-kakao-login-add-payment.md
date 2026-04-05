# 카카오 로그인 제거 + 비회원 결제 + 고유링크 공유 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 카카오 로그인을 제거하고, 비회원이 결제 후 결과를 열람하고 고유 링크로 공유할 수 있도록 전환한다.

**Architecture:** 프론트에서 차트 계산 → Supabase에 결과 저장(고유 코드) → 결과 조회/결제 검증은 Cloudflare Functions를 통해 서버 사이드로 처리. 미결제 시 첫 문장만, 결제 시 전체 reading 반환.

**Tech Stack:** React + Vite + Zustand + Supabase + Cloudflare Pages Functions + PortOne SDK v2

---

## File Structure

### 삭제
- `src/lib/kakao.ts` — 카카오 OAuth 래퍼
- `src/stores/authStore.ts` — 인증 상태 관리

### 수정
- `src/App.tsx` — 라우트 `/result/:code` 변경
- `src/lib/supabase.ts` — Auth 코드 제거
- `src/pages/Landing.tsx` — 로그인 제거, CTA 단순화, 푸터 사업자 정보
- `src/pages/InputForm.tsx` — Supabase insert + `/result/:code` 이동
- `src/pages/Result.tsx` — API 조회, 블러/CTA, 결제 UI, 공유
- `src/pages/Terms.tsx` — 하우워즈 정보로 교체
- `src/pages/Privacy.tsx` — 하우워즈 정보로 교체

### 신규
- `src/lib/payment.ts` — PortOne SDK 래퍼
- `src/lib/generateCode.ts` — nanoid 기반 고유 코드 생성
- `src/components/PaywallOverlay.tsx` — 블러 + CTA 오버레이
- `functions/api/result/[code].ts` — 결과 조회 API (서버)
- `functions/api/payment/complete.ts` — 결제 검증 API (서버)
- `functions/shared/generateReading.ts` — 서버용 reading 생성 (클라이언트 코드 복사)
- `wrangler.toml` — Cloudflare Functions 설정

---

## Task 1: 카카오 로그인 제거 + supabase 정리

**Files:**
- Delete: `src/lib/kakao.ts`
- Delete: `src/stores/authStore.ts`
- Modify: `src/lib/supabase.ts`
- Modify: `src/pages/Landing.tsx`
- Modify: `src/pages/InputForm.tsx`
- Modify: `src/pages/Result.tsx`

- [ ] **Step 1: `src/lib/kakao.ts` 삭제**

```bash
rm src/lib/kakao.ts
```

- [ ] **Step 2: `src/stores/authStore.ts` 삭제**

```bash
rm src/stores/authStore.ts
```

- [ ] **Step 3: `src/lib/supabase.ts`에서 Auth 관련 import 없는지 확인, Supabase 키를 환경변수로 변경**

`src/lib/supabase.ts` 전체를 다음으로 교체:

```typescript
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://uikchwmbortfpncjnipk.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpa2Nod21ib3J0ZnBuY2puaXBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NzUxNDAsImV4cCI6MjA5MDA1MTE0MH0.4_-Ci9NkadZRV_wAKPbMwS0U2ipLui7Ztfwp8Ynpd1c'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
```

- [ ] **Step 4: `src/pages/Landing.tsx` — 카카오 로그인/로그아웃/이전 결과 제거, CTA 단순화**

전체 교체. 핵심 변경:
- `kakao.ts`, `authStore`, `supabase` import 제거
- 모든 로그인/로그아웃 상태 로직 제거 (`user`, `loggingIn`, `hasSaved`, `authReady` 등)
- CTA 영역을 "내 별지도 펼쳐보기" 버튼 하나로 단순화
- "로그인 없이 시작하기" 버튼 제거

```tsx
import { useNavigate, Link } from 'react-router-dom'

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

      {/* 별 배경 — 기존과 동일 */}
      <div className="absolute inset-0" style={{ pointerEvents: 'none' }} aria-hidden>
        {STARS.map(s => (
          <div
            key={s.id}
            className="absolute rounded-full bg-white"
            style={{
              top: s.top, left: s.left, width: s.size, height: s.size,
              opacity: s.opacity,
              animation: `nc-breathe ${2.5 + parseFloat(s.delay)}s ease-in-out ${s.delay} infinite`,
            }}
          />
        ))}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(197,160,40,0.07) 0%, transparent 65%)' }}
        />
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

      {/* CTA — 단일 버튼 */}
      <div className="relative" style={{ animation: 'kakao-float 2.8s ease-in-out infinite', zIndex: 10 }}>
        <button
          onClick={() => navigate('/input')}
          className="group relative flex items-center gap-3 px-8 py-4 text-text text-sm tracking-wider transition-all duration-300 font-sans cursor-pointer"
          style={{
            background: 'rgba(197,160,40,0.12)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(197,160,40,0.4)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(197,160,40,0.2)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(197,160,40,0.7)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(197,160,40,0.12)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(197,160,40,0.4)'
          }}
        >
          <span className="text-gold/80">✦</span>
          <span>내 별지도 펼쳐보기</span>
          <span className="text-gold/70 transition-transform duration-300 group-hover:translate-x-1">→</span>
        </button>
      </div>

      {/* 피처 섹션 — 기존과 동일 */}
      <div className="relative w-full max-w-sm mx-auto mt-20 mb-16 space-y-5">
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

      {/* 하단 — 사업자 정보 추가 */}
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
        <p className="text-[10px] text-text-muted/30 mt-1">
          하우워즈 · 대표 송산해 · 사업자등록번호 413-24-01458
        </p>
        <p className="text-[10px] text-text-muted/30">
          통신판매업 제 2023-서울강남-01292호
        </p>
        <p className="text-[10px] text-text-muted/30 tracking-widest mt-1">
          &copy; 2026 별지도
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: `src/pages/InputForm.tsx` — authStore 의존성 제거**

현재 InputForm.tsx는 authStore를 import하지 않으므로 변경 불필요. 확인만 수행.

```bash
grep -n "authStore\|kakao" src/pages/InputForm.tsx
```

Expected: 결과 없음 (의존성 없음)

- [ ] **Step 6: `src/pages/Result.tsx` — authStore 의존성 임시 제거**

이 태스크에서는 authStore import와 사용만 제거. 전체 리팩토링은 Task 4에서 수행.

변경:
- Line 4: `import { useAuthStore } from '@/stores/authStore'` 삭제
- Line 141: `const { user, saveResult } = useAuthStore()` 삭제
- Lines 162-165: `useEffect` (자동 저장) 삭제

```tsx
// Line 4 제거
// Line 141 제거
// Lines 158-165의 useEffect 제거:
//   useEffect(() => {
//     if (data && user) { saveResult(data.input, data.chart) }
//   }, [data?.input, user?.id])
```

- [ ] **Step 7: 빌드 확인**

```bash
cd /c/Users/mtsun/OneDrive/Desktop/byeoljido && npm run build
```

Expected: 빌드 성공 (kakao.ts, authStore.ts 의존성 완전 제거됨)

- [ ] **Step 8: 커밋**

```bash
git add -A && git commit -m "refactor: 카카오 로그인 전면 제거 + Landing CTA 단순화 + 푸터 사업자 정보 교체"
```

---

## Task 2: Supabase 스키마 변경 + 고유 코드 생성

**Files:**
- Create: `src/lib/generateCode.ts`
- Modify: `src/pages/InputForm.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: nanoid 설치**

```bash
cd /c/Users/mtsun/OneDrive/Desktop/byeoljido && npm install nanoid
```

- [ ] **Step 2: `src/lib/generateCode.ts` 생성**

```typescript
import { customAlphabet } from 'nanoid'

// base62: 영문 대소문자 + 숫자 (URL-safe, 6자 = 62^6 ≈ 57B 조합)
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 6)

export function generateCode(): string {
  return nanoid()
}
```

- [ ] **Step 3: Supabase results 테이블 재구성**

Supabase 대시보드에서 SQL Editor로 실행 (수동 작업):

```sql
-- 기존 테이블 삭제 (데이터 백업 필요 시 먼저 수행)
drop table if exists results;

-- 새 테이블 생성
create table results (
  id text primary key,
  input jsonb not null,
  chart jsonb not null,
  paid boolean default false,
  payment_id text,
  created_at timestamptz default now()
);

-- RLS 활성화
alter table results enable row level security;

-- anon key로 insert만 허용 (select/update는 service_role만)
create policy "anon_insert" on results for insert to anon with check (true);
```

> **Note:** 이 SQL은 Supabase 대시보드에서 수동으로 실행. 코드에 포함하지 않음.

- [ ] **Step 4: `src/pages/InputForm.tsx` — Supabase에 결과 저장 + `/result/:code` 이동**

`handleSubmit` 함수 내부를 수정:

```tsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChartStore } from '@/stores/chartStore'
import { calculateChart } from '@/lib/astro'
import { supabase } from '@/lib/supabase'
import { generateCode } from '@/lib/generateCode'
import CitySearch from '@/components/CitySearch'
import type { City } from '@/stores/chartStore'
```

`handleSubmit`의 setTimeout 콜백 내부를 교체:

```typescript
      try {
        const input = {
          nickname: nickname.trim(),
          year: parseInt(year),
          month: parseInt(month),
          day: parseInt(day),
          hour: parseInt(hour),
          minute: parseInt(minute),
          city: city!,
        }

        const chart = calculateChart(
          input.year, input.month, input.day,
          input.hour, input.minute,
          input.city.lat, input.city.lng,
        )

        setInput(input)
        setChart(chart)

        // Supabase에 결과 저장
        const code = generateCode()
        const { error: insertError } = await supabase
          .from('results')
          .insert({ id: code, input, chart })

        if (insertError) {
          console.error('결과 저장 실패:', insertError)
          setError('결과 저장 중 오류가 발생했습니다. 다시 시도해주세요.')
          setIsLoading(false)
          return
        }

        navigate(`/result/${code}`)
      } catch (err) {
        console.error('Chart calculation error:', err)
        setError('차트 계산 중 오류가 발생했습니다. 입력 정보를 확인해주세요.')
        setIsLoading(false)
      }
```

> **주의:** setTimeout 콜백을 `async`로 변경 필요: `setTimeout(async () => {`

- [ ] **Step 5: `src/App.tsx` — 라우트 변경**

```tsx
import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'

const Landing = lazy(() => import('@/pages/Landing'))
const Intro = lazy(() => import('@/pages/Intro'))
const InputForm = lazy(() => import('@/pages/InputForm'))
const Result = lazy(() => import('@/pages/Result'))
const Terms = lazy(() => import('@/pages/Terms'))
const Privacy = lazy(() => import('@/pages/Privacy'))

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-text-muted text-lg">Loading...</div>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/intro" element={<Intro />} />
        <Route path="/input" element={<InputForm />} />
        <Route path="/result/:code" element={<Result />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
      </Routes>
    </Suspense>
  )
}
```

- [ ] **Step 6: 빌드 확인**

```bash
npm run build
```

Expected: 빌드 성공

- [ ] **Step 7: 커밋**

```bash
git add -A && git commit -m "feat: Supabase 결과 저장 + nanoid 고유 코드 + 라우트 /result/:code"
```

---

## Task 3: Cloudflare Functions 세팅 + 결과 조회 API

**Files:**
- Create: `wrangler.toml`
- Create: `functions/api/result/[code].ts`
- Create: `functions/shared/reading.ts`

- [ ] **Step 1: `wrangler.toml` 생성**

```toml
name = "byeoljido-git"
compatibility_date = "2024-09-23"
pages_build_output_dir = "dist"

[vars]
SUPABASE_URL = "https://uikchwmbortfpncjnipk.supabase.co"

# secrets (wrangler secret put으로 설정):
# SUPABASE_SERVICE_KEY
# PORTONE_API_SECRET
```

- [ ] **Step 2: `functions/shared/reading.ts` — 서버용 reading 생성 유틸**

`generateReading`은 클라이언트의 `@/data/templates/*`와 `@/lib/*`에 의존하므로, Cloudflare Functions에서 직접 import할 수 없다. 대신 **결과 생성은 클라이언트에서 수행하고, Supabase에 생성된 reading도 함께 저장**하는 전략으로 변경한다.

즉:
- InputForm에서 `calculateChart()` → `generateReading()` → `reading` 결과를 Supabase에 저장
- Functions API는 Supabase에서 reading을 가져와서 paid 여부에 따라 필터링만 수행

`functions/shared/reading.ts`:

```typescript
export interface PreviewSection {
  chapter: string
  title: string
  subtitle?: string
  firstSentence: string
}

export interface FullReading {
  chartSummary: { title: string; body: string }
  sections: Array<{
    id: string
    title: string
    subtitle?: string
    badges?: Array<{ symbol: string; label: string; sign: string; house?: number }>
    starMovement: string
    body: string
    action?: string
  }>
}

export function extractPreview(reading: FullReading): PreviewSection[] {
  const preview: PreviewSection[] = []

  // 프롤로그
  preview.push({
    chapter: 'prologue',
    title: '당신이 태어나던 순간의 하늘',
    subtitle: reading.chartSummary.title,
    firstSentence: reading.chartSummary.body.split('\n\n')[0].split('. ')[0] + '.',
  })

  // 각 섹션
  for (const section of reading.sections) {
    preview.push({
      chapter: section.id,
      title: section.title,
      subtitle: section.subtitle,
      firstSentence: section.body.split('\n\n')[0].split('. ')[0] + '.',
    })
  }

  return preview
}
```

- [ ] **Step 3: `functions/api/result/[code].ts` — 결과 조회 API**

```typescript
import { extractPreview } from '../../shared/reading'
import type { FullReading } from '../../shared/reading'

interface Env {
  SUPABASE_URL: string
  SUPABASE_SERVICE_KEY: string
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const code = context.params.code as string
  const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = context.env

  // Supabase REST API로 직접 조회 (service_role key)
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/results?id=eq.${code}&select=input,reading,paid`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    },
  )

  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'DB 조회 실패' }), { status: 500 })
  }

  const rows = await res.json() as Array<{ input: unknown; reading: FullReading; paid: boolean }>
  if (rows.length === 0) {
    return new Response(JSON.stringify({ error: '결과를 찾을 수 없습니다' }), { status: 404 })
  }

  const row = rows[0]

  if (row.paid) {
    return Response.json({ paid: true, input: row.input, reading: row.reading })
  }

  // 미결제: 미리보기만 반환
  const preview = extractPreview(row.reading)
  return Response.json({ paid: false, input: row.input, preview })
}
```

- [ ] **Step 4: Supabase 스키마에 `reading` 컬럼 추가**

Supabase 대시보드에서 SQL Editor로 실행 (수동):

```sql
alter table results add column reading jsonb;
```

- [ ] **Step 5: `src/pages/InputForm.tsx` — reading도 함께 저장하도록 수정**

import 추가:

```typescript
import { generateReading } from '@/lib/generateReading'
```

handleSubmit의 Supabase insert 부분 수정:

```typescript
        const reading = generateReading(chart, input.nickname)

        const code = generateCode()
        const { error: insertError } = await supabase
          .from('results')
          .insert({ id: code, input, chart, reading })
```

- [ ] **Step 6: 빌드 확인**

```bash
npm run build
```

- [ ] **Step 7: 커밋**

```bash
git add -A && git commit -m "feat: Cloudflare Functions 결과 조회 API + wrangler 설정"
```

---

## Task 4: Result 페이지 리팩토링 (API 조회 + 블러/페이월)

**Files:**
- Create: `src/components/PaywallOverlay.tsx`
- Modify: `src/pages/Result.tsx`

- [ ] **Step 1: `src/components/PaywallOverlay.tsx` 생성**

```tsx
interface PaywallOverlayProps {
  onPurchase: () => void
  loading?: boolean
}

export default function PaywallOverlay({ onPurchase, loading }: PaywallOverlayProps) {
  return (
    <div className="relative">
      {/* 블러 배경 (빈 텍스트 느낌) */}
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
          <p className="text-text-muted text-sm mb-4">나머지 내용을 확인하려면</p>
          <button
            onClick={onPurchase}
            disabled={loading}
            className="px-8 py-3.5 text-sm font-sans tracking-wider cursor-pointer transition-all duration-300 disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #9A7B1A 0%, #C5A028 50%, #e2c96a 100%)',
              color: '#fff',
              border: 'none',
              boxShadow: '0 4px 20px rgba(197,160,40,0.3)',
            }}
          >
            {loading ? '결제 처리 중...' : '1,900원에 전체 별지도 열기'}
          </button>
          <p className="text-text-muted/50 text-[11px] mt-3">카카오페이 · 토스페이</p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: `src/pages/Result.tsx` 전체 리팩토링**

핵심 변경:
- `useParams`로 `:code` 받기
- API(`/api/result/:code`)로 조회
- `paid` 상태에 따라 전체/미리보기 분기
- 미결제 시 각 섹션 첫 문장 + PaywallOverlay
- 공유 URL을 `${origin}/result/${code}`로 변경

```tsx
import { useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useChartStore } from '@/stores/chartStore'
import { generateReading } from '@/lib/generateReading'
import type { ReadingSection, StarBadge, Reading } from '@/lib/generateReading'
import type { BirthInput } from '@/stores/chartStore'
import NightSky from '@/components/NightSky'
import TextRenderer from '@/components/TextRenderer'
import LifeCycleGraph from '@/components/LifeCycleGraph'
import PaywallOverlay from '@/components/PaywallOverlay'

// AstroIcon, BadgeItem, Ornament, BodyText, ChapterSection — 기존 그대로 유지 (생략 없이 복사)
// ... (Task 1에서 authStore 제거된 버전 기준)

interface PreviewSection {
  chapter: string
  title: string
  subtitle?: string
  firstSentence: string
}

interface ResultData {
  paid: boolean
  input: BirthInput
  reading?: Reading
  preview?: PreviewSection[]
}

export default function Result() {
  const navigate = useNavigate()
  const { code } = useParams<{ code: string }>()
  const storeInput = useChartStore(s => s.input)
  const storeChart = useChartStore(s => s.chart)
  const [data, setData] = useState<ResultData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [purchasing, setPurchasing] = useState(false)

  // API로 결과 조회
  useEffect(() => {
    if (!code) { navigate('/input'); return }

    fetch(`/api/result/${code}`)
      .then(res => {
        if (!res.ok) throw new Error('not found')
        return res.json()
      })
      .then((d: ResultData) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => {
        // API 실패 시 로컬 store에서 fallback (방금 생성한 경우)
        if (storeInput && storeChart) {
          const reading = generateReading(storeChart, storeInput.nickname)
          setData({ paid: false, input: storeInput, reading })
          setLoading(false)
        } else {
          navigate('/input')
        }
      })
  }, [code]) // eslint-disable-line

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/result/${code}`
    const title = data ? `${data.input.nickname}님의 별지도` : '별지도'
    if (navigator.share) {
      await navigator.share({ title, url })
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }, [code, data])

  const handlePurchase = useCallback(async () => {
    setPurchasing(true)
    try {
      // Task 5에서 구현할 결제 함수 호출
      const { requestPayment } = await import('@/lib/payment')
      const paymentId = await requestPayment(code!)
      if (!paymentId) { setPurchasing(false); return }

      // 결제 검증
      const res = await fetch('/api/payment/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, paymentId }),
      })

      if (!res.ok) throw new Error('결제 검증 실패')

      // 결제 성공 — 전체 데이터 다시 조회
      const fullData = await fetch(`/api/result/${code}`).then(r => r.json())
      setData(fullData)
    } catch (err) {
      console.error('결제 오류:', err)
      alert('결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setPurchasing(false)
    }
  }, [code])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-text-muted font-serif italic">별을 읽고 있습니다...</div>
  }
  if (!data) return null

  const { input, paid, reading, preview } = data
  const chart = useChartStore.getState().chart

  // 결제 완료 시 reading 데이터로 렌더
  if (paid && reading) {
    const basicSections = reading.sections.filter(s => BASIC_IDS.includes(s.id))
    const otherSections = SECTION_ORDER
      .map(id => reading.sections.find(s => s.id === id))
      .filter((s): s is ReadingSection => !!s)

    return (
      <main className="max-w-lg mx-auto pb-32">
        {/* 기존 Result 렌더링 로직 전체 — header, NightSky, prologue, parts 1-4, epilogue */}
        {/* handleShare의 URL만 변경됨: generateShareUrl → /result/${code} */}
        {/* 기존 코드와 동일하므로 그대로 유지 */}

        {/* 표지 */}
        <header className="pt-28 pb-20 px-8 text-center">
          {/* ... 기존과 동일 ... */}
        </header>

        {/* NightSky */}
        {chart && (
          <section className="px-8 mb-6">
            <NightSky chart={chart} />
          </section>
        )}

        {/* 이하 프롤로그, Part 1-4, 에필로그 모두 기존과 동일 */}
        {/* ... */}
      </main>
    )
  }

  // 미결제 시 — 미리보기 + 페이월
  return (
    <main className="max-w-lg mx-auto pb-32">
      {/* 표지 — 동일 */}
      <header className="pt-28 pb-20 px-8 text-center">
        <p className="text-[11px] text-text-muted tracking-[0.3em] uppercase mb-8 font-display">
          A Celestial Portrait
        </p>
        <h1 className="text-4xl text-text mb-3 leading-snug" style={{ fontFamily: "'Cafe24Classictype', cursive" }}>
          {input.nickname}님의 별지도
        </h1>
        <div className="flex items-center justify-center gap-3 my-6">
          <div className="w-12 h-px bg-gold/60" />
          <span className="text-gold text-xs">✦</span>
          <div className="w-12 h-px bg-gold/60" />
        </div>
        <p className="text-sm text-text-muted leading-relaxed">
          {input.year}년 {input.month}월 {input.day}일&ensp;
          {String(input.hour).padStart(2, '0')}시 {String(input.minute).padStart(2, '0')}분
        </p>
      </header>

      {/* NightSky — chart가 있으면 표시 */}
      {chart && (
        <>
          <section className="px-8 mb-6">
            <NightSky chart={chart} />
          </section>
          <p className="text-center text-[10px] text-text-muted/50 tracking-[0.2em] uppercase font-display mb-24">
            The sky at the moment of birth
          </p>
        </>
      )}

      <Ornament />

      {/* 미리보기 섹션들 */}
      {preview && preview.map((p, i) => (
        <section key={p.chapter} className="px-8 mb-12">
          {i === 0 ? (
            <>
              <p className="text-[10px] text-text-muted tracking-[0.25em] uppercase mb-3 font-display">Prologue</p>
              <h2 className="text-2xl font-serif text-text mb-2">{p.title}</h2>
              {p.subtitle && <p className="text-sm text-text-muted italic mb-8">{p.subtitle}</p>}
            </>
          ) : (
            <h3 className="text-lg font-serif text-text mb-3">{p.title}</h3>
          )}
          <p className="text-[15px] text-text/75 leading-[1.9]">{p.firstSentence}</p>

          {/* 첫 번째 미리보기 이후 페이월 표시 */}
          {i === 0 && <div className="mt-8"><PaywallOverlay onPurchase={handlePurchase} loading={purchasing} /></div>}
        </section>
      ))}

      {/* 프롤로그 이후가 아닌 경우에도 하단에 CTA */}
      {(!preview || preview.length === 0) && (
        <div className="px-8">
          <PaywallOverlay onPurchase={handlePurchase} loading={purchasing} />
        </div>
      )}

      {/* 공유 + 새 별지도 */}
      <footer className="px-8 text-center mt-16">
        <button
          onClick={handleShare}
          className="w-full max-w-xs py-3 mb-3 border border-text/30 text-text text-sm tracking-wider hover:bg-text hover:text-bg transition-colors cursor-pointer font-sans"
        >
          {copied ? '링크가 복사됐어요 ✦' : '내 결과지 공유하기'}
        </button>

        <button
          onClick={() => navigate('/input')}
          className="w-full max-w-xs py-3 border border-text/30 text-text text-sm tracking-wider hover:bg-text hover:text-bg transition-colors cursor-pointer font-sans"
        >
          다른 별지도 펼쳐보기
        </button>
      </footer>
    </main>
  )
}
```

> **주의:** 위 코드는 핵심 구조를 보여주는 것. 실제 구현 시 기존 Result.tsx의 AstroIcon, BadgeItem, Ornament, BodyText, ChapterSection 컴포넌트를 그대로 유지하고, paid/unpaid 분기만 추가하는 것이 정확하다. 기존 렌더링 코드를 복사하지 말고 조건부 렌더링으로 감싸는 방식으로 진행할 것.

- [ ] **Step 3: 빌드 확인**

```bash
npm run build
```

Expected: `@/lib/payment`가 아직 없으므로 빌드 실패할 수 있음. dynamic import이므로 빌드는 통과할 수 있다. 통과하지 않으면 payment.ts를 빈 모듈로 먼저 생성.

- [ ] **Step 4: 커밋**

```bash
git add -A && git commit -m "feat: Result 페이지 API 조회 + 블러/페이월 + 고유링크 공유"
```

---

## Task 5: PortOne 결제 연동

**Files:**
- Create: `src/lib/payment.ts`
- Create: `functions/api/payment/complete.ts`

- [ ] **Step 1: PortOne SDK 설치**

```bash
cd /c/Users/mtsun/OneDrive/Desktop/byeoljido && npm install @portone/browser-sdk
```

- [ ] **Step 2: `src/lib/payment.ts` 생성**

```typescript
import * as PortOne from '@portone/browser-sdk/v2'

const STORE_ID = import.meta.env.VITE_PORTONE_STORE_ID || ''

// 카카오페이 채널키, 토스페이 채널키 (Cloudflare env 또는 .env에서)
const CHANNEL_KEY_KAKAOPAY = import.meta.env.VITE_PORTONE_CHANNEL_KAKAOPAY || ''
const CHANNEL_KEY_TOSSPAY = import.meta.env.VITE_PORTONE_CHANNEL_TOSSPAY || ''

export type PayMethod = 'kakaopay' | 'tosspay'

export async function requestPayment(code: string, method: PayMethod = 'kakaopay'): Promise<string | null> {
  const paymentId = `byeoljido-${code}-${Date.now()}`
  const channelKey = method === 'kakaopay' ? CHANNEL_KEY_KAKAOPAY : CHANNEL_KEY_TOSSPAY

  const response = await PortOne.requestPayment({
    storeId: STORE_ID,
    channelKey,
    paymentId,
    orderName: '별지도 전체 리포트',
    totalAmount: 1900,
    currency: 'CURRENCY_KRW',
    payMethod: method === 'kakaopay' ? 'EASY_PAY' : 'EASY_PAY',
  })

  if (!response || response.code) {
    // 결제 취소 또는 에러
    if (response?.code === 'FAILURE_TYPE_PG') return null
    return null
  }

  return response.paymentId
}
```

- [ ] **Step 3: `functions/api/payment/complete.ts` 생성**

```typescript
interface Env {
  SUPABASE_URL: string
  SUPABASE_SERVICE_KEY: string
  PORTONE_API_SECRET: string
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { code, paymentId } = await context.request.json() as { code: string; paymentId: string }

  if (!code || !paymentId) {
    return Response.json({ error: '필수 파라미터 누락' }, { status: 400 })
  }

  const { SUPABASE_URL, SUPABASE_SERVICE_KEY, PORTONE_API_SECRET } = context.env

  // 1. PortOne API로 결제 검증
  const portoneRes = await fetch(`https://api.portone.io/payments/${encodeURIComponent(paymentId)}`, {
    headers: { 'Authorization': `PortOne ${PORTONE_API_SECRET}` },
  })

  if (!portoneRes.ok) {
    return Response.json({ error: 'PortOne 결제 조회 실패' }, { status: 500 })
  }

  const payment = await portoneRes.json() as { status: string; amount: { total: number } }

  // 2. 결제 상태 및 금액 검증
  if (payment.status !== 'PAID') {
    return Response.json({ error: '결제가 완료되지 않았습니다' }, { status: 400 })
  }

  if (payment.amount.total !== 1900) {
    return Response.json({ error: '결제 금액이 일치하지 않습니다' }, { status: 400 })
  }

  // 3. Supabase 업데이트 — paid: true, payment_id 저장
  const updateRes = await fetch(
    `${SUPABASE_URL}/rest/v1/results?id=eq.${code}`,
    {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ paid: true, payment_id: paymentId }),
    },
  )

  if (!updateRes.ok) {
    return Response.json({ error: 'DB 업데이트 실패' }, { status: 500 })
  }

  return Response.json({ success: true })
}
```

- [ ] **Step 4: Result.tsx에서 결제 수단 선택 UI 추가**

`handlePurchase`에서 method 선택을 위해, PaywallOverlay에 두 버튼(카카오페이/토스페이)을 추가하거나, 모달로 선택하게 변경.

PaywallOverlay 수정:

```tsx
import type { PayMethod } from '@/lib/payment'

interface PaywallOverlayProps {
  onPurchase: (method: PayMethod) => void
  loading?: boolean
}

export default function PaywallOverlay({ onPurchase, loading }: PaywallOverlayProps) {
  return (
    <div className="relative">
      <div
        className="select-none pointer-events-none"
        style={{ filter: 'blur(8px)' }}
        aria-hidden
      >
        <p className="text-[15px] text-text/75 leading-[1.9]">
          당신의 별지도에 담긴 이야기가 여기 이어집니다. 태어난 순간의 하늘이 들려주는 메시지를 확인해보세요. 별들의 배치가 말하는 당신만의 고유한 패턴과 흐름이 기다리고 있습니다. 지금 이 순간에도 별들은 당신의 길을 비추고 있습니다.
        </p>
      </div>

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
```

Result.tsx의 `handlePurchase`도 method를 받도록 수정:

```typescript
  const handlePurchase = useCallback(async (method: PayMethod) => {
    setPurchasing(true)
    try {
      const { requestPayment } = await import('@/lib/payment')
      const paymentId = await requestPayment(code!, method)
      // ... 나머지 동일
    }
  }, [code])
```

PaywallOverlay 호출 부분도 수정:

```tsx
<PaywallOverlay onPurchase={handlePurchase} loading={purchasing} />
```

- [ ] **Step 5: 빌드 확인**

```bash
npm run build
```

- [ ] **Step 6: 커밋**

```bash
git add -A && git commit -m "feat: PortOne 결제 연동 (카카오페이/토스페이) + 서버 검증 API"
```

---

## Task 6: 이용약관 + 개인정보처리방침 교체

**Files:**
- Modify: `src/pages/Terms.tsx`
- Modify: `src/pages/Privacy.tsx`

- [ ] **Step 1: `src/pages/Terms.tsx` 전체 교체**

핵심 변경사항:
- 모든 "숨숨" → "하우워즈"
- 모든 "안경진" → "송산해"
- 사업자등록번호: 140-44-01387 → 413-24-01458
- 주소: 서울특별시 중랑구 신내로 127, 909동 405호 → 서울특별시 금천구 디지털로10길 78, 941-77호(가산동, 가산테라타워)
- 통신판매업: "신고 예정" → "제 2023-서울강남-01292호"
- 고객센터: "[미기재]" → "contact@questionperday.me"
- **제6조 (외부계정(카카오) 로그인 및 회원 관리)** 전체 삭제
- 서비스 성격 설명에서 "카카오 로그인" 관련 문구 모두 삭제
- 이후 조항 번호 재정렬

모든 치환을 `replace_all` 방식으로 수행:
- `숨숨` → `하우워즈`
- `안경진` → `송산해`
- `140-44-01387` → `413-24-01458`
- 주소, 통신판매업, 고객센터 각각 치환
- 제6조 카카오 로그인 조항 블록 삭제

- [ ] **Step 2: `src/pages/Privacy.tsx` 전체 교체**

핵심 변경사항:
- 모든 "숨숨" → "하우워즈"
- 모든 "안경진" → "송산해"
- 사업자등록번호: 140-44-01387 → 413-24-01458
- **카카오 로그인 수집 항목 삭제**: "외부계정(카카오) 연동 로그인" 관련 수집 항목 전체 삭제
- **출생 정보 수집 추가**: "서비스 이용 시 수집: 닉네임, 생년월일, 출생시간, 출생지(도시명, 좌표)" 추가
- 위탁 항목에서 "카카오(주)" 삭제
- 위탁 항목에서 결제 처리 PG → "포트원(PortOne)" 으로 기재
- 개인정보보호책임자 연락처: contact@questionperday.me
- 푸터 사업자 정보도 동일하게 교체

- [ ] **Step 3: 빌드 확인**

```bash
npm run build
```

- [ ] **Step 4: 커밋**

```bash
git add -A && git commit -m "chore: 이용약관/개인정보처리방침 하우워즈 정보로 교체 + 카카오 로그인 조항 삭제"
```

---

## Task 7: 환경 변수 설정 + Cloudflare Secrets + 최종 빌드/배포

**Files:**
- Create/Modify: `.env` (로컬)
- Cloudflare 대시보드 설정 (수동)

- [ ] **Step 1: `.env` 파일 생성/확인**

```env
VITE_SUPABASE_URL=https://uikchwmbortfpncjnipk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpa2Nod21ib3J0ZnBuY2puaXBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NzUxNDAsImV4cCI6MjA5MDA1MTE0MH0.4_-Ci9NkadZRV_wAKPbMwS0U2ipLui7Ztfwp8Ynpd1c
VITE_PORTONE_STORE_ID=<PortOne Store ID>
VITE_PORTONE_CHANNEL_KAKAOPAY=<카카오페이 채널키>
VITE_PORTONE_CHANNEL_TOSSPAY=<토스페이 채널키>
```

- [ ] **Step 2: Cloudflare Functions secrets 설정 (수동)**

```bash
cd /c/Users/mtsun/OneDrive/Desktop/byeoljido
npx wrangler pages secret put SUPABASE_SERVICE_KEY --project-name=byeoljido-git
npx wrangler pages secret put PORTONE_API_SECRET --project-name=byeoljido-git
```

- [ ] **Step 3: Cloudflare 대시보드에서 환경 변수 설정 (수동)**

Settings → Environment Variables:
- `SUPABASE_URL`: `https://uikchwmbortfpncjnipk.supabase.co`
- `SUPABASE_SERVICE_KEY`: (Supabase 대시보드에서 service_role key 복사)
- `PORTONE_API_SECRET`: (PortOne 대시보드에서 API Secret 복사)

프론트엔드용 (빌드 시):
- `VITE_PORTONE_STORE_ID`
- `VITE_PORTONE_CHANNEL_KAKAOPAY`
- `VITE_PORTONE_CHANNEL_TOSSPAY`

- [ ] **Step 4: 최종 빌드 확인**

```bash
cd /c/Users/mtsun/OneDrive/Desktop/byeoljido && npm run build
```

- [ ] **Step 5: `.gitignore`에 `.env` 확인**

```bash
grep -q "^\.env$" .gitignore || echo ".env" >> .gitignore
```

- [ ] **Step 6: 최종 커밋**

```bash
git add -A && git commit -m "chore: 환경 변수 설정 + .gitignore"
```

- [ ] **Step 7: GitHub push + 배포**

```bash
git push origin master
```

Cloudflare Pages가 GitHub 연결이므로 자동 배포됨.

---

## Task 요약

| Task | 내용 | 핵심 파일 |
|------|------|-----------|
| 1 | 카카오 로그인 제거 | kakao.ts, authStore.ts 삭제, Landing.tsx |
| 2 | Supabase 스키마 + 고유 코드 + 라우트 | generateCode.ts, InputForm.tsx, App.tsx |
| 3 | Cloudflare Functions + 결과 조회 API | wrangler.toml, functions/api/result/ |
| 4 | Result 페이지 리팩토링 (API + 블러) | Result.tsx, PaywallOverlay.tsx |
| 5 | PortOne 결제 연동 | payment.ts, functions/api/payment/ |
| 6 | 약관/개인정보처리방침 교체 | Terms.tsx, Privacy.tsx |
| 7 | 환경 변수 + 배포 | .env, Cloudflare secrets |
