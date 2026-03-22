import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChartStore } from '@/stores/chartStore'
import { calculateChart } from '@/lib/astro'
import CitySearch from '@/components/CitySearch'
import type { City } from '@/stores/chartStore'

export default function InputForm() {
  const navigate = useNavigate()
  const { setInput, setChart } = useChartStore()

  const [nickname, setNickname] = useState('')
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const [hour, setHour] = useState('')
  const [minute, setMinute] = useState('')
  const [city, setCity] = useState<City | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const currentYear = new Date().getFullYear()

  function validate(): string | null {
    if (!nickname.trim()) return '닉네임을 입력해주세요.'
    const y = parseInt(year), m = parseInt(month), d = parseInt(day)
    const h = parseInt(hour), min = parseInt(minute)
    if (!y || y < 1900 || y > currentYear) return '올바른 출생연도를 입력해주세요.'
    if (!m || m < 1 || m > 12) return '올바른 월을 입력해주세요.'
    if (!d || d < 1 || d > 31) return '올바른 일을 입력해주세요.'
    if (isNaN(h) || h < 0 || h > 23) return '올바른 시간을 입력해주세요. (0~23)'
    if (isNaN(min) || min < 0 || min > 59) return '올바른 분을 입력해주세요. (0~59)'
    if (!city) return '출생 도시를 선택해주세요.'
    return null
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }

    setIsLoading(true)
    setError('')

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
      navigate('/result')
    } catch {
      setError('차트 계산 중 오류가 발생했습니다. 입력 정보를 확인해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text mb-2">당신의 별을 읽어드릴게요</h1>
          <p className="text-text-muted text-sm">태어난 순간의 하늘을 정확히 복원하기 위해, 아래 정보를 입력해주세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 닉네임 */}
          <div>
            <label className="block text-sm text-text-muted mb-1.5">닉네임</label>
            <input
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="결과지에 표시될 이름"
              maxLength={20}
              className="w-full px-4 py-3 bg-bg-input border border-border rounded-lg text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* 생년월일 */}
          <div>
            <label className="block text-sm text-text-muted mb-1.5">생년월일</label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                value={year}
                onChange={e => setYear(e.target.value)}
                placeholder="년 (YYYY)"
                min={1900}
                max={currentYear}
                className="px-4 py-3 bg-bg-input border border-border rounded-lg text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition-colors"
              />
              <input
                type="number"
                value={month}
                onChange={e => setMonth(e.target.value)}
                placeholder="월"
                min={1}
                max={12}
                className="px-4 py-3 bg-bg-input border border-border rounded-lg text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition-colors"
              />
              <input
                type="number"
                value={day}
                onChange={e => setDay(e.target.value)}
                placeholder="일"
                min={1}
                max={31}
                className="px-4 py-3 bg-bg-input border border-border rounded-lg text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* 출생시간 */}
          <div>
            <label className="block text-sm text-text-muted mb-1.5">출생 시간</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={hour}
                onChange={e => setHour(e.target.value)}
                placeholder="시 (0~23)"
                min={0}
                max={23}
                className="px-4 py-3 bg-bg-input border border-border rounded-lg text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition-colors"
              />
              <input
                type="number"
                value={minute}
                onChange={e => setMinute(e.target.value)}
                placeholder="분 (0~59)"
                min={0}
                max={59}
                className="px-4 py-3 bg-bg-input border border-border rounded-lg text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <p className="text-xs text-text-muted/60 mt-1">정확한 시간을 모르시면 12시 0분을 입력해주세요.</p>
          </div>

          {/* 출생 도시 */}
          <CitySearch value={city} onChange={setCity} />

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-medium rounded-lg transition-colors cursor-pointer"
          >
            {isLoading ? '별을 읽고 있어요...' : '내 별지도 보기'}
          </button>
        </form>
      </div>
    </div>
  )
}
