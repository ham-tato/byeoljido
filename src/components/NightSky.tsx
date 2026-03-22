import { useEffect, useRef } from 'react'
import type { ChartData } from '@/stores/chartStore'

// 태양과 달만 큼직하게, 나머지는 밝은 별처럼
const CELESTIAL: Record<string, { label: string; color: string; glow: string; radius: number; isMain: boolean }> = {
  '태양': { label: '태양', color: '#FCD34D', glow: '#FBBF24', radius: 10, isMain: true },
  '달': { label: '달', color: '#E8E4DC', glow: '#CBD5E1', radius: 8, isMain: true },
  '수성': { label: '', color: '#93C5FD', glow: '#60A5FA', radius: 2.5, isMain: false },
  '금성': { label: '', color: '#FCA5A5', glow: '#F87171', radius: 3, isMain: false },
  '화성': { label: '', color: '#FCA5A5', glow: '#EF4444', radius: 2.5, isMain: false },
  '목성': { label: '', color: '#DDD6FE', glow: '#A78BFA', radius: 3.5, isMain: false },
  '토성': { label: '', color: '#D6D3D1', glow: '#A8A29E', radius: 3, isMain: false },
}

export default function NightSky({ chart }: { chart: ChartData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

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
    bg.addColorStop(0, '#151530')
    bg.addColorStop(0.6, '#0d0d25')
    bg.addColorStop(1, '#06060f')
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fillStyle = bg
    ctx.fill()

    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.clip()

    // 배경 별
    const rand = (n: number) => {
      const x = Math.sin(n * 127.1 + 42) * 43758.5453
      return x - Math.floor(x)
    }
    for (let i = 0; i < 180; i++) {
      const sx = rand(i * 2) * size
      const sy = rand(i * 2 + 1) * size
      const sr = rand(i * 3) * 1.0 + 0.2
      const op = rand(i * 5) * 0.5 + 0.15
      ctx.beginPath()
      ctx.arc(sx, sy, sr, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,255,255,${op})`
      ctx.fill()
    }

    // 은하수
    const mw = ctx.createLinearGradient(0, cy - 30, size, cy + 30)
    mw.addColorStop(0, 'rgba(130,130,200,0)')
    mw.addColorStop(0.4, 'rgba(130,130,200,0.035)')
    mw.addColorStop(0.6, 'rgba(130,130,200,0.035)')
    mw.addColorStop(1, 'rgba(130,130,200,0)')
    ctx.fillStyle = mw
    ctx.fillRect(0, cy - 40, size, 80)

    // 행성 배치
    const orbitR = r * 0.62
    const entries = Object.entries(chart.planets).filter(([n]) => CELESTIAL[n])

    for (const [name, pos] of entries) {
      const c = CELESTIAL[name]
      if (!c) continue

      const angle = ((270 - pos.degree) * Math.PI) / 180
      const px = cx + Math.cos(angle) * orbitR
      const py = cy - Math.sin(angle) * orbitR

      if (c.isMain) {
        // 태양/달: 글로우 + 본체 + 라벨
        const glowSize = c.radius * 4
        const glow = ctx.createRadialGradient(px, py, 0, px, py, glowSize)
        glow.addColorStop(0, c.glow + '30')
        glow.addColorStop(0.5, c.glow + '10')
        glow.addColorStop(1, c.glow + '00')
        ctx.beginPath()
        ctx.arc(px, py, glowSize, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()

        // 본체
        ctx.beginPath()
        ctx.arc(px, py, c.radius, 0, Math.PI * 2)
        ctx.fillStyle = c.color
        ctx.fill()

        // 달이면 초승달 모양 음영
        if (name === '달') {
          ctx.beginPath()
          ctx.arc(px + 3, py - 2, c.radius * 0.85, 0, Math.PI * 2)
          ctx.fillStyle = '#151530'
          ctx.fill()
        }

        // 한글 라벨
        ctx.font = '11px Pretendard, sans-serif'
        ctx.fillStyle = 'rgba(255,255,255,0.7)'
        ctx.textAlign = 'center'
        ctx.fillText(c.label, px, py + c.radius + 14)
      } else {
        // 나머지: 작은 빛나는 점
        const glow = ctx.createRadialGradient(px, py, 0, px, py, c.radius * 3)
        glow.addColorStop(0, c.glow + '25')
        glow.addColorStop(1, c.glow + '00')
        ctx.beginPath()
        ctx.arc(px, py, c.radius * 3, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()

        ctx.beginPath()
        ctx.arc(px, py, c.radius, 0, Math.PI * 2)
        ctx.fillStyle = c.color
        ctx.fill()
      }
    }

    ctx.restore()

    // 테두리
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(197,160,40,0.2)'
    ctx.lineWidth = 1
    ctx.stroke()
  }, [chart])

  return (
    <div className="flex justify-center">
      <canvas ref={canvasRef} className="rounded-full" style={{ width: 300, height: 300 }} />
    </div>
  )
}
