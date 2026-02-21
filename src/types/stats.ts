import type { ActivityType, DrinkType } from '@/types/database'

export type StatsPeriod = 'daily' | 'weekly' | 'monthly'

export interface DateRange {
  start: Date
  end: Date
}

export interface DailyActivityCount {
  date: string
  counts: Partial<Record<ActivityType, number>>
  total: number
}

export interface DailyDrinkIntake {
  date: string
  intakes: Partial<Record<DrinkType, number>>
  total: number
}

export interface DailySleepDuration {
  date: string
  minutes: number
}
