import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  isToday,
  isFuture,
  addMonths,
  subMonths,
  format,
} from 'date-fns'
import { ko } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MonthlyCalendarProps {
  currentMonth: Date
  onMonthChange: (date: Date) => void
  onDateSelect: (date: Date) => void
  activityDates: Record<string, number>
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

const MonthlyCalendar = ({
  currentMonth,
  onMonthChange,
  onDateSelect,
  activityDates,
}: MonthlyCalendarProps) => {
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDayOfWeek = getDay(monthStart)

  const today = new Date()
  const isCurrentMonth =
    currentMonth.getFullYear() === today.getFullYear() &&
    currentMonth.getMonth() === today.getMonth()

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between rounded-xl bg-muted/50 px-1 py-1">
        <Button
          variant="ghost"
          size="icon"
          className="min-h-[44px] min-w-[44px] cursor-pointer"
          onClick={() => onMonthChange(subMonths(currentMonth, 1))}
          aria-label="이전 월"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">
            {format(currentMonth, 'yyyy년 M월', { locale: ko })}
          </span>
          {!isCurrentMonth && (
            <Button
              variant="secondary"
              size="sm"
              className="h-7 cursor-pointer text-xs"
              onClick={() => onMonthChange(new Date())}
            >
              이번 달
            </Button>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="min-h-[44px] min-w-[44px] cursor-pointer"
          disabled={isCurrentMonth}
          onClick={() => onMonthChange(addMonths(currentMonth, 1))}
          aria-label="다음 월"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center">
        {WEEKDAYS.map((day, i) => (
          <div
            key={day}
            className={cn(
              'py-2 text-xs font-bold',
              i === 0 ? 'text-rose-400' : i === 6 ? 'text-blue-400' : 'text-muted-foreground',
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {/* Empty cells before month start */}
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd')
          const count = activityDates[dateKey] ?? 0
          const todayDate = isToday(day)
          const futureDate = isFuture(day) && !isSameDay(day, new Date())
          const dayOfWeek = getDay(day)

          return (
            <button
              key={dateKey}
              type="button"
              disabled={futureDate}
              onClick={() => onDateSelect(day)}
              className={cn(
                'relative mx-auto flex h-11 w-11 cursor-pointer flex-col items-center justify-center rounded-xl text-sm font-medium transition-all duration-150',
                'hover:bg-primary/10',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                todayDate && 'bg-primary text-primary-foreground font-bold shadow-sm hover:bg-primary/90',
                futureDate && 'cursor-default text-muted-foreground/30 hover:bg-transparent',
                !todayDate && !futureDate && dayOfWeek === 0 && 'text-rose-500 dark:text-rose-400',
                !todayDate && !futureDate && dayOfWeek === 6 && 'text-blue-500 dark:text-blue-400',
              )}
            >
              {day.getDate()}
              {count > 0 && !todayDate && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />
              )}
              {count > 0 && todayDate && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary-foreground" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default MonthlyCalendar
