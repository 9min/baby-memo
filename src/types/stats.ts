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

export interface SleepSession {
  startMinute: number  // 0~1439 (자정 기준 분)
  endMinute: number    // endMinute > startMinute 보장 (자정 넘기면 +1440)
  startLabel: string   // "21:30"
  endLabel: string     // "06:15"
}
