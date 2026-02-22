import {
  startOfDay, endOfDay,
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  addDays, addWeeks, addMonths,
  format, eachDayOfInterval,
} from 'date-fns'
import { ko } from 'date-fns/locale'
import type { Activity, ActivityType, DrinkType, DrinkMetadata, SleepMetadata } from '@/types/database'
import type { StatsPeriod, DateRange, DailyActivityCount, DailyDrinkIntake, DailySleepDuration } from '@/types/stats'

export function getDateRange(period: StatsPeriod, anchor: Date): DateRange {
  switch (period) {
    case 'daily':
      return { start: startOfDay(anchor), end: endOfDay(anchor) }
    case 'weekly':
      return {
        start: startOfWeek(anchor, { weekStartsOn: 1 }),
        end: endOfWeek(anchor, { weekStartsOn: 1 }),
      }
    case 'monthly':
      return { start: startOfMonth(anchor), end: endOfMonth(anchor) }
  }
}

export function navigateDate(anchor: Date, period: StatsPeriod, direction: 1 | -1): Date {
  switch (period) {
    case 'daily':
      return addDays(anchor, direction)
    case 'weekly':
      return addWeeks(anchor, direction)
    case 'monthly':
      return addMonths(anchor, direction)
  }
}

export function formatPeriodLabel(period: StatsPeriod, dateRange: DateRange): string {
  switch (period) {
    case 'daily':
      return format(dateRange.start, 'M월 d일 (EEE)', { locale: ko })
    case 'weekly':
      return `${format(dateRange.start, 'M/d')} ~ ${format(dateRange.end, 'M/d')}`
    case 'monthly':
      return format(dateRange.start, 'yyyy년 M월', { locale: ko })
  }
}

function toDateKey(dateStr: string): string {
  return format(new Date(dateStr), 'yyyy-MM-dd')
}

export function aggregateActivityCounts(
  activities: Activity[],
  dateRange: DateRange,
): DailyActivityCount[] {
  const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end })
  const map = new Map<string, Partial<Record<ActivityType, number>>>()

  for (const day of days) {
    map.set(format(day, 'yyyy-MM-dd'), {})
  }

  for (const a of activities) {
    const key = toDateKey(a.recorded_at)
    const counts = map.get(key)
    if (counts) {
      counts[a.type] = (counts[a.type] ?? 0) + 1
    }
  }

  return days.map((day) => {
    const key = format(day, 'yyyy-MM-dd')
    const counts = map.get(key) ?? {}
    const total = Object.values(counts).reduce((s, n) => s + (n ?? 0), 0)
    return { date: key, counts, total }
  })
}

export function aggregateDrinkIntake(
  activities: Activity[],
  dateRange: DateRange,
): DailyDrinkIntake[] {
  const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end })
  const map = new Map<string, Partial<Record<DrinkType, number>>>()

  for (const day of days) {
    map.set(format(day, 'yyyy-MM-dd'), {})
  }

  for (const a of activities) {
    if (a.type !== 'drink') continue
    const meta = a.metadata as DrinkMetadata
    const key = toDateKey(a.recorded_at)
    const intakes = map.get(key)
    if (intakes) {
      intakes[meta.drink_type] = (intakes[meta.drink_type] ?? 0) + meta.amount_ml
    }
  }

  return days.map((day) => {
    const key = format(day, 'yyyy-MM-dd')
    const intakes = map.get(key) ?? {}
    const total = Object.values(intakes).reduce((s, n) => s + (n ?? 0), 0)
    return { date: key, intakes, total }
  })
}

export function aggregateSleepDuration(
  activities: Activity[],
  dateRange: DateRange,
): DailySleepDuration[] {
  const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end })
  const map = new Map<string, number>()

  for (const day of days) {
    map.set(format(day, 'yyyy-MM-dd'), 0)
  }

  for (const a of activities) {
    if (a.type !== 'sleep') continue
    const meta = a.metadata as SleepMetadata
    if (!meta.end_time) continue
    const startTime = new Date(a.recorded_at).getTime()
    const endTime = new Date(meta.end_time).getTime()
    const minutes = Math.max(0, Math.round((endTime - startTime) / 60000))
    const key = toDateKey(a.recorded_at)
    const current = map.get(key)
    if (current !== undefined) {
      map.set(key, current + minutes)
    }
  }

  return days.map((day) => {
    const key = format(day, 'yyyy-MM-dd')
    return { date: key, minutes: map.get(key) ?? 0 }
  })
}

export const ACTIVITY_CHART_COLORS: Record<ActivityType, string> = {
  solid_food: '#f59e0b',
  drink: '#0ea5e9',
  supplement: '#8b5cf6',
  diaper: '#10b981',
  sleep: '#6366f1',
  memo: '#f43f5e',
}

export const DRINK_CHART_COLORS: Record<DrinkType, string> = {
  formula: '#f59e0b',
  milk: '#c084fc',
  water: '#38bdf8',
}

export function formatXAxisLabel(dateStr: string, period: StatsPeriod): string {
  const date = new Date(dateStr)
  switch (period) {
    case 'daily':
      return format(date, 'HH시')
    case 'weekly':
      return format(date, 'EEE', { locale: ko })
    case 'monthly':
      return format(date, 'd')
  }
}
