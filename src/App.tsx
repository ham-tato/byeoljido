import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'

const Landing = lazy(() => import('@/pages/Landing'))
const Intro = lazy(() => import('@/pages/Intro'))
const InputForm = lazy(() => import('@/pages/InputForm'))
const Result = lazy(() => import('@/pages/Result'))
const Terms = lazy(() => import('@/pages/Terms'))
const Privacy = lazy(() => import('@/pages/Privacy'))
const Payment = lazy(() => import('@/pages/Payment'))

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
        <Route path="/payment/:code" element={<Payment />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
      </Routes>
    </Suspense>
  )
}
