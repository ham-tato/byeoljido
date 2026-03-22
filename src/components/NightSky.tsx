import { useEffect, useRef } from 'react'
import type { ChartData } from '@/stores/chartStore'
import { CONSTELLATIONS } from '@/data/constellations'

export default function NightSky({ chart }: { chart: ChartData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sunSign = chart.planets['태양']?.sign || '양자리'

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const size = 300
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(dpr, dpr)

    const cx = size / 2
    const cy = size / 2
    const r = size / 2 - 2

    // 배경
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
    bg.addColorStop(0, '#171735')
    bg.addColorStop(0.5, '#0e0e28')
    bg.addColorStop(1, '#070712')
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fillStyle = bg
    ctx.fill()

    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.clip()

    // 배경 별 (어두운 것들)
    const rand = (n: number) => {
      const x = Math.sin(n * 127.1 + 42) * 43758.5453
      return x - Math.floor(x)
    }
    for (let i = 0; i < 150; i++) {
      const sx = rand(i * 2) * size
      const sy = rand(i * 2 + 1) * size
      const sr = rand(i * 3) * 0.8 + 0.2
      const op = rand(i * 5) * 0.3 + 0.08
      ctx.beginPath()
      ctx.arc(sx, sy, sr, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,255,255,${op})`
      ctx.fill()
    }

    // ── 별자리 그리기 ──
    const constellation = CONSTELLATIONS[sunSign]
    if (constellation) {
      const margin = 50
      const drawArea = size - margin * 2
      const stars = constellation.stars.map(([x, y, b]) => ({
        x: margin + x * drawArea,
        y: margin + y * drawArea,
        brightness: b,
      }))

      // 연결선 (별자리 선)
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.25)'
      ctx.lineWidth = 1
      for (const [a, b] of constellation.lines) {
        ctx.beginPath()
        ctx.moveTo(stars[a].x, stars[a].y)
        ctx.lineTo(stars[b].x, stars[b].y)
        ctx.stroke()
      }

      // 별 렌더링
      for (const star of stars) {
        const starR = star.brightness * 2.5 + 1

        // 외곽 글로우
        const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, starR * 6)
        glow.addColorStop(0, `rgba(212, 175, 55, ${star.brightness * 0.15})`)
        glow.addColorStop(1, 'rgba(212, 175, 55, 0)')
        ctx.beginPath()
        ctx.arc(star.x, star.y, starR * 6, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()

        // 본체
        ctx.beginPath()
        ctx.arc(star.x, star.y, starR, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 248, 230, ${star.brightness * 0.7 + 0.3})`
        ctx.fill()
      }
    }

    ctx.restore()

    // 테두리
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(197,160,40,0.15)'
    ctx.lineWidth = 1
    ctx.stroke()
  }, [chart, sunSign])

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} className="rounded-full" style={{ width: 300, height: 300 }} />
      <p className="mt-4 text-sm font-serif text-text-muted">{sunSign}</p>
    </div>
  )
}
