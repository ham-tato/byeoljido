import { useEffect, useRef } from 'react'
import type { ChartData } from '@/stores/chartStore'

const PLANET_DISPLAY: Record<string, { symbol: string; color: string; size: number }> = {
  '태양': { symbol: '☉', color: '#FBBF24', size: 18 },
  '달': { symbol: '☽', color: '#E2E8F0', size: 16 },
  '수성': { symbol: '☿', color: '#67E8F9', size: 12 },
  '금성': { symbol: '♀', color: '#F9A8D4', size: 13 },
  '화성': { symbol: '♂', color: '#FCA5A5', size: 13 },
  '목성': { symbol: '♃', color: '#C4B5FD', size: 14 },
  '토성': { symbol: '♄', color: '#D6D3D1', size: 13 },
}

interface Props {
  chart: ChartData
}

export default function NightSky({ chart }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const size = 320
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(dpr, dpr)

    const cx = size / 2
    const cy = size / 2
    const radius = size / 2 - 4

    // 배경: 깊은 남색 원
    const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
    bgGrad.addColorStop(0, '#1a1a3e')
    bgGrad.addColorStop(0.7, '#0f0f2a')
    bgGrad.addColorStop(1, '#080818')
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.fillStyle = bgGrad
    ctx.fill()

    // 클리핑: 원 안에만 렌더
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.clip()

    // 별 (랜덤 배경)
    const starSeed = 42
    for (let i = 0; i < 200; i++) {
      const pseudoRand = (n: number) => {
        const x = Math.sin(n * 127.1 + starSeed) * 43758.5453
        return x - Math.floor(x)
      }
      const sx = pseudoRand(i * 2) * size
      const sy = pseudoRand(i * 2 + 1) * size
      const sr = pseudoRand(i * 3) * 1.2 + 0.3
      const opacity = pseudoRand(i * 5) * 0.6 + 0.2
      ctx.beginPath()
      ctx.arc(sx, sy, sr, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
      ctx.fill()
    }

    // 은하수 느낌 (얇은 밴드)
    const milkyWay = ctx.createLinearGradient(0, cy - 40, size, cy + 40)
    milkyWay.addColorStop(0, 'rgba(100, 100, 180, 0)')
    milkyWay.addColorStop(0.3, 'rgba(100, 100, 180, 0.04)')
    milkyWay.addColorStop(0.5, 'rgba(120, 120, 200, 0.06)')
    milkyWay.addColorStop(0.7, 'rgba(100, 100, 180, 0.04)')
    milkyWay.addColorStop(1, 'rgba(100, 100, 180, 0)')
    ctx.fillStyle = milkyWay
    ctx.fillRect(0, cy - 50, size, 100)

    // 행성 배치 (황도 원 위에)
    const orbitRadius = radius * 0.65
    const planetEntries = Object.entries(chart.planets)
      .filter(([name]) => PLANET_DISPLAY[name])

    // 얇은 황도 원
    ctx.beginPath()
    ctx.arc(cx, cy, orbitRadius, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.15)'
    ctx.lineWidth = 1
    ctx.stroke()

    // 행성 렌더
    for (const [name, pos] of planetEntries) {
      const display = PLANET_DISPLAY[name]
      if (!display) continue

      // degree를 각도로 변환 (0도=양자리 시작, 시계방향이 아닌 반시계방향)
      const angleRad = ((270 - pos.degree) * Math.PI) / 180
      const px = cx + Math.cos(angleRad) * orbitRadius
      const py = cy - Math.sin(angleRad) * orbitRadius

      // 글로우
      const glow = ctx.createRadialGradient(px, py, 0, px, py, display.size)
      glow.addColorStop(0, display.color + '40')
      glow.addColorStop(1, display.color + '00')
      ctx.beginPath()
      ctx.arc(px, py, display.size, 0, Math.PI * 2)
      ctx.fillStyle = glow
      ctx.fill()

      // 심볼
      ctx.font = `${display.size}px sans-serif`
      ctx.fillStyle = display.color
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(display.symbol, px, py)
    }

    // ASC 마커
    const ascDeg = chart.ascendant.degree
    const ascAngle = ((270 - ascDeg) * Math.PI) / 180
    const ascX = cx + Math.cos(ascAngle) * (orbitRadius + 20)
    const ascY = cy - Math.sin(ascAngle) * (orbitRadius + 20)
    ctx.font = '10px sans-serif'
    ctx.fillStyle = '#D4AF37'
    ctx.textAlign = 'center'
    ctx.fillText('ASC', ascX, ascY)

    ctx.restore()

    // 테두리
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)'
    ctx.lineWidth = 1.5
    ctx.stroke()
  }, [chart])

  return (
    <div className="flex justify-center">
      <canvas
        ref={canvasRef}
        className="rounded-full"
        style={{ width: 320, height: 320 }}
      />
    </div>
  )
}
