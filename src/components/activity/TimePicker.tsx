import { useState } from 'react'
import { addDays, subDays, isToday, isBefore, startOfDay, format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TimePickerProps {
  value: Date
  onChange: (date: Date) => void
  label?: string
}

const HOURS_12 = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

const TimePicker = ({ value, onChange, label = '시간' }: TimePickerProps) => {
  const [editing, setEditing] = useState(false)

  const FIVE_MIN = 5 * 60000 // eslint-disable-line react-hooks/purity
  const maxTime = Math.ceil(Date.now() / FIVE_MIN) * FIVE_MIN // eslint-disable-line react-hooks/purity
  const wouldBeFuture = value.getTime() + FIVE_MIN > maxTime
  const canGoForward = isBefore(startOfDay(value), startOfDay(new Date())) // eslint-disable-line react-hooks/purity

  const adjust = (minutes: number) => {
    const max = Math.ceil(Date.now() / FIVE_MIN) * FIVE_MIN
    const next = new Date(value.getTime() + minutes * 60000)
    if (next.getTime() <= max) {
      onChange(next)
    }
  }

  const hours24 = value.getHours()
  const isPM = hours24 >= 12
  const hour12 = hours24 % 12 || 12
  const minute = value.getMinutes()

  const tryChange = (ampm: 'AM' | 'PM', h12: number, min: number) => {
    const next = new Date(value)
    const h24 = ampm === 'PM'
      ? (h12 === 12 ? 12 : h12 + 12)
      : (h12 === 12 ? 0 : h12)
    next.setHours(h24, min, 0, 0)
    onChange(next)
  }

  const ampmValue = isPM ? 'PM' : 'AM'

  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl bg-muted/50 py-3">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center justify-center gap-1">
        <button
          type="button"
          aria-label="이전 날짜"
          className="p-1 rounded-md text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
          onClick={() => onChange(subDays(value, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium tabular-nums">
          {isToday(value)
            ? `오늘 · ${format(value, 'M월 d일 (E)', { locale: ko })}`
            : format(value, 'M월 d일 (E)', { locale: ko })}
        </span>
        <button
          type="button"
          aria-label="다음 날짜"
          className="p-1 rounded-md text-muted-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          onClick={() => onChange(addDays(value, 1))}
          disabled={!canGoForward}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="flex items-center justify-center gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-10 w-12 cursor-pointer text-xs font-semibold"
          onClick={() => adjust(-5)}
        >
          -5
        </Button>

        {editing ? (
          <div className="flex items-center justify-center gap-1 min-w-[120px]">
            <select
              className="h-8 rounded-md border bg-background px-1 text-sm font-semibold cursor-pointer"
              value={ampmValue}
              onChange={(e) => tryChange(e.target.value as 'AM' | 'PM', hour12, minute)}
            >
              <option value="AM">오전</option>
              <option value="PM">오후</option>
            </select>
            <select
              className="h-8 rounded-md border bg-background px-1 text-base font-bold cursor-pointer tabular-nums"
              value={hour12}
              onChange={(e) => tryChange(ampmValue, Number(e.target.value), minute)}
            >
              {HOURS_12.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
            <span className="text-base font-bold">:</span>
            <select
              className="h-8 rounded-md border bg-background px-1 text-base font-bold cursor-pointer tabular-nums"
              value={minute}
              onChange={(e) => tryChange(ampmValue, hour12, Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
                <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
              ))}
            </select>
            <button
              type="button"
              className="ml-1 rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-muted transition-colors"
              onClick={() => setEditing(false)}
            >
              확인
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="min-w-[120px] text-center text-xl font-bold tabular-nums cursor-pointer rounded-lg py-1 hover:bg-muted/80 transition-colors"
            onClick={() => setEditing(true)}
          >
            {format(value, 'a h:mm', { locale: ko })}
          </button>
        )}

        <Button
          type="button"
          variant="outline"
          className="h-10 w-12 cursor-pointer text-xs font-semibold"
          onClick={() => adjust(5)}
          disabled={wouldBeFuture}
        >
          +5
        </Button>
      </div>
    </div>
  )
}

export default TimePicker
