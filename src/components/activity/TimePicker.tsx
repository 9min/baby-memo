import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Button } from '@/components/ui/button'

interface TimePickerProps {
  value: Date
  onChange: (date: Date) => void
  label?: string
}

export const roundToNearest5 = (date: Date): Date => {
  const rounded = new Date(date)
  const minutes = rounded.getMinutes()
  const remainder = minutes % 5
  if (remainder < 3) {
    rounded.setMinutes(minutes - remainder, 0, 0)
  } else {
    rounded.setMinutes(minutes + (5 - remainder), 0, 0)
  }
  if (rounded > new Date()) {
    rounded.setMinutes(rounded.getMinutes() - 5)
  }
  return rounded
}

const TimePicker = ({ value, onChange, label = '시간' }: TimePickerProps) => {
  const adjust = (minutes: number) => {
    const next = new Date(value.getTime() + minutes * 60000)
    if (next <= new Date()) {
      onChange(next)
    }
  }

  const isFuture = (minutes: number) => value.getTime() + minutes * 60000 > Date.now()

  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl bg-muted/50 py-3">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center justify-center gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-10 w-12 cursor-pointer text-xs font-semibold"
          onClick={() => adjust(-5)}
        >
          -5
        </Button>
        <span className="min-w-[120px] text-center text-xl font-bold tabular-nums">
          {format(value, 'a h:mm', { locale: ko })}
        </span>
        <Button
          type="button"
          variant="outline"
          className="h-10 w-12 cursor-pointer text-xs font-semibold"
          onClick={() => adjust(5)}
          disabled={isFuture(5)}
        >
          +5
        </Button>
      </div>
    </div>
  )
}

export default TimePicker
