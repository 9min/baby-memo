import { format, addDays, subDays, isToday } from 'date-fns'
import { ko } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DateNavigatorProps {
  date: Date
  onDateChange: (date: Date) => void
}

const DateNavigator = ({ date, onDateChange }: DateNavigatorProps) => {
  const dateLabel = isToday(date)
    ? `오늘 · ${format(date, 'M월 d일 (E)', { locale: ko })}`
    : format(date, 'M월 d일 (E)', { locale: ko })

  return (
    <div className="flex items-center justify-between rounded-xl bg-muted/50 px-1 py-1">
      <Button
        variant="ghost"
        size="icon"
        className="min-h-[44px] min-w-[44px] cursor-pointer"
        onClick={() => onDateChange(subDays(date, 1))}
        aria-label="이전 날짜"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold">{dateLabel}</span>
        {!isToday(date) && (
          <Button
            variant="secondary"
            size="sm"
            className="h-7 cursor-pointer text-xs"
            onClick={() => onDateChange(new Date())}
          >
            오늘
          </Button>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="min-h-[44px] min-w-[44px] cursor-pointer"
        disabled={isToday(date)}
        onClick={() => onDateChange(addDays(date, 1))}
        aria-label="다음 날짜"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  )
}

export default DateNavigator
