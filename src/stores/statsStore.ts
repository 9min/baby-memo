import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Activity } from '@/types/database'
import type { StatsPeriod, DateRange, DailyActivityCount, DailyDrinkIntake, DailySleepDuration } from '@/types/stats'
import {
  getDateRange,
  navigateDate,
  aggregateActivityCounts,
  aggregateDrinkIntake,
  aggregateSleepDuration,
} from '@/lib/statsUtils'

interface StatsState {
  period: StatsPeriod
  anchorDate: Date
  dateRange: DateRange
  rawActivities: Activity[]
  activityCounts: DailyActivityCount[]
  drinkIntakes: DailyDrinkIntake[]
  sleepDurations: DailySleepDuration[]
  loading: boolean

  setPeriod: (period: StatsPeriod) => void
  navigatePrev: () => void
  navigateNext: () => void
  goToToday: () => void
  fetchStats: (familyId: string) => Promise<void>
}

function computeAggregates(activities: Activity[], dateRange: DateRange) {
  return {
    activityCounts: aggregateActivityCounts(activities, dateRange),
    drinkIntakes: aggregateDrinkIntake(activities, dateRange),
    sleepDurations: aggregateSleepDuration(activities, dateRange),
  }
}

export const useStatsStore = create<StatsState>((set, get) => {
  const initialAnchor = new Date()
  const initialRange = getDateRange('daily', initialAnchor)

  return {
    period: 'daily',
    anchorDate: initialAnchor,
    dateRange: initialRange,
    rawActivities: [],
    activityCounts: [],
    drinkIntakes: [],
    sleepDurations: [],
    loading: false,

    setPeriod: (period: StatsPeriod) => {
      const anchor = get().anchorDate
      const dateRange = getDateRange(period, anchor)
      set({ period, dateRange })
    },

    navigatePrev: () => {
      const { anchorDate, period } = get()
      const newAnchor = navigateDate(anchorDate, period, -1)
      const dateRange = getDateRange(period, newAnchor)
      set({ anchorDate: newAnchor, dateRange })
    },

    navigateNext: () => {
      const { anchorDate, period } = get()
      const newAnchor = navigateDate(anchorDate, period, 1)
      const dateRange = getDateRange(period, newAnchor)
      set({ anchorDate: newAnchor, dateRange })
    },

    goToToday: () => {
      const { period } = get()
      const today = new Date()
      const dateRange = getDateRange(period, today)
      set({ anchorDate: today, dateRange })
    },

    fetchStats: async (familyId: string) => {
      const { dateRange } = get()
      set({ loading: true })

      const { data } = await supabase
        .from('activities')
        .select('*')
        .eq('family_id', familyId)
        .gte('recorded_at', dateRange.start.toISOString())
        .lte('recorded_at', dateRange.end.toISOString())
        .order('recorded_at', { ascending: true })

      const activities = (data as Activity[]) ?? []
      const aggregates = computeAggregates(activities, dateRange)

      set({
        rawActivities: activities,
        ...aggregates,
        loading: false,
      })
    },
  }
})
