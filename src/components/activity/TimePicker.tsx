import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TimePickerProps {
  value: Date
  onChange: (date: Date) => void
}

const TimePicker = ({ value, onChange }: TimePickerProps) => {
  const adjust = (minutes: number) => {
    const next = new Date(value.getTime() + minutes * 60000)
    if (next <= new Date()) {
      onChange(next)
    }
  }

  const isFuture = (minutes: number) => value.getTime() + minutes * 60000 > Date.now()

  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl bg-muted/50 py-3">
      <span className="text-xs font-medium text-muted-foreground">시간</span>
      <div className="flex items-center justify-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          className="h-10 w-12 cursor-pointer text-xs font-semibold"
          onClick={() => adjust(-5)}
        >
          -5
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 cursor-pointer"
          onClick={() => adjust(-1)}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="min-w-[120px] text-center text-xl font-bold tabular-nums">
          {format(value, 'a h:mm', { locale: ko })}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 cursor-pointer"
          onClick={() => adjust(1)}
          disabled={isFuture(1)}
        >
          <Plus className="h-4 w-4" />
        </Button>
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
