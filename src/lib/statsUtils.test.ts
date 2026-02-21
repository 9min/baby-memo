import { describe, it, expect, beforeEach } from 'vitest'
import {
  getDateRange,
  navigateDate,
  formatPeriodLabel,
  aggregateActivityCounts,
  aggregateDrinkIntake,
  aggregateSleepDuration,
  ACTIVITY_CHART_COLORS,
  DRINK_CHART_COLORS,
  formatXAxisLabel,
} from './statsUtils'
import { createMockActivity, resetMockActivityCounter } from '@/test/helpers/mockActivity'
import type { DrinkMetadata, SleepMetadata } from '@/types/database'

describe('getDateRange', () => {
  it('returns start and end of day for daily period', () => {
    const anchor = new Date('2025-06-15T14:30:00')
    const range = getDateRange('daily', anchor)
    expect(range.start.getHours()).toBe(0)
    expect(range.start.getMinutes()).toBe(0)
    expect(range.end.getHours()).toBe(23)
    expect(range.end.getMinutes()).toBe(59)
    expect(range.start.getDate()).toBe(15)
    expect(range.end.getDate()).toBe(15)
  })

  it('returns Monday to Sunday for weekly period', () => {
    // 2025-06-15 is a Sunday
    const anchor = new Date('2025-06-15T14:30:00')
    const range = getDateRange('weekly', anchor)
    expect(range.start.getDay()).toBe(1) // Monday
    expect(range.end.getDay()).toBe(0) // Sunday
  })

  it('returns start and end of month for monthly period', () => {
    const anchor = new Date('2025-06-15T14:30:00')
    const range = getDateRange('monthly', anchor)
    expect(range.start.getDate()).toBe(1)
    expect(range.end.getDate()).toBe(30) // June has 30 days
  })
})

describe('navigateDate', () => {
  it('adds one day for daily +1', () => {
    const anchor = new Date('2025-06-15')
    const result = navigateDate(anchor, 'daily', 1)
    expect(result.getDate()).toBe(16)
  })

  it('subtracts one day for daily -1', () => {
    const anchor = new Date('2025-06-15')
    const result = navigateDate(anchor, 'daily', -1)
    expect(result.getDate()).toBe(14)
  })

  it('adds one week for weekly +1', () => {
    const anchor = new Date('2025-06-15')
    const result = navigateDate(anchor, 'weekly', 1)
    expect(result.getDate()).toBe(22)
  })

  it('subtracts one week for weekly -1', () => {
    const anchor = new Date('2025-06-15')
    const result = navigateDate(anchor, 'weekly', -1)
    expect(result.getDate()).toBe(8)
  })

  it('adds one month for monthly +1', () => {
    const anchor = new Date('2025-06-15')
    const result = navigateDate(anchor, 'monthly', 1)
    expect(result.getMonth()).toBe(6) // July
  })

  it('subtracts one month for monthly -1', () => {
    const anchor = new Date('2025-06-15')
    const result = navigateDate(anchor, 'monthly', -1)
    expect(result.getMonth()).toBe(4) // May
  })
})

describe('formatPeriodLabel', () => {
  it('formats daily label with date and day of week', () => {
    const range = getDateRange('daily', new Date('2025-06-15'))
    const label = formatPeriodLabel('daily', range)
    expect(label).toMatch(/6월 15일/)
  })

  it('formats weekly label with date range', () => {
    const range = getDateRange('weekly', new Date('2025-06-15'))
    const label = formatPeriodLabel('weekly', range)
    expect(label).toMatch(/~/)
  })

  it('formats monthly label with year and month', () => {
    const range = getDateRange('monthly', new Date('2025-06-15'))
    const label = formatPeriodLabel('monthly', range)
    expect(label).toBe('2025년 6월')
  })
})

describe('aggregateActivityCounts', () => {
  beforeEach(() => {
    resetMockActivityCounter()
  })

  it('returns empty counts for days with no activities', () => {
    const range = getDateRange('daily', new Date('2025-06-15'))
    const result = aggregateActivityCounts([], range)
    expect(result).toHaveLength(1)
    expect(result[0].total).toBe(0)
  })

  it('counts activities by type per day', () => {
    const range = getDateRange('daily', new Date('2025-01-15'))
    const activities = [
      createMockActivity({ type: 'solid_food', recorded_at: '2025-01-15T08:00:00' }),
      createMockActivity({ type: 'solid_food', recorded_at: '2025-01-15T12:00:00' }),
      createMockActivity({ type: 'drink', recorded_at: '2025-01-15T10:00:00' }),
    ]
    const result = aggregateActivityCounts(activities, range)
    expect(result[0].counts.solid_food).toBe(2)
    expect(result[0].counts.drink).toBe(1)
    expect(result[0].total).toBe(3)
  })

  it('creates entries for each day in weekly range', () => {
    const range = getDateRange('weekly', new Date('2025-06-15'))
    const result = aggregateActivityCounts([], range)
    expect(result).toHaveLength(7)
  })

  it('ignores activities outside the date range', () => {
    const range = getDateRange('daily', new Date('2025-01-15'))
    const activities = [
      createMockActivity({ type: 'solid_food', recorded_at: '2025-01-14T23:59:59' }),
    ]
    const result = aggregateActivityCounts(activities, range)
    expect(result[0].total).toBe(0)
  })
})

describe('aggregateDrinkIntake', () => {
  beforeEach(() => {
    resetMockActivityCounter()
  })

  it('returns empty intakes for days with no drinks', () => {
    const range = getDateRange('daily', new Date('2025-06-15'))
    const result = aggregateDrinkIntake([], range)
    expect(result).toHaveLength(1)
    expect(result[0].total).toBe(0)
  })

  it('sums drink amounts by type', () => {
    const range = getDateRange('daily', new Date('2025-01-15'))
    const activities = [
      createMockActivity({
        type: 'drink',
        recorded_at: '2025-01-15T08:00:00',
        metadata: { drink_type: 'formula', amount_ml: 100 } satisfies DrinkMetadata,
      }),
      createMockActivity({
        type: 'drink',
        recorded_at: '2025-01-15T12:00:00',
        metadata: { drink_type: 'formula', amount_ml: 150 } satisfies DrinkMetadata,
      }),
      createMockActivity({
        type: 'drink',
        recorded_at: '2025-01-15T15:00:00',
        metadata: { drink_type: 'water', amount_ml: 50 } satisfies DrinkMetadata,
      }),
    ]
    const result = aggregateDrinkIntake(activities, range)
    expect(result[0].intakes.formula).toBe(250)
    expect(result[0].intakes.water).toBe(50)
    expect(result[0].total).toBe(300)
  })

  it('ignores non-drink activities', () => {
    const range = getDateRange('daily', new Date('2025-01-15'))
    const activities = [
      createMockActivity({ type: 'solid_food', recorded_at: '2025-01-15T08:00:00' }),
    ]
    const result = aggregateDrinkIntake(activities, range)
    expect(result[0].total).toBe(0)
  })
})

describe('aggregateSleepDuration', () => {
  beforeEach(() => {
    resetMockActivityCounter()
  })

  it('returns 0 minutes for days with no sleep', () => {
    const range = getDateRange('daily', new Date('2025-06-15'))
    const result = aggregateSleepDuration([], range)
    expect(result).toHaveLength(1)
    expect(result[0].minutes).toBe(0)
  })

  it('calculates duration from recorded_at to end_time', () => {
    const range = getDateRange('daily', new Date('2025-01-15'))
    const activities = [
      createMockActivity({
        type: 'sleep',
        recorded_at: '2025-01-15T21:00:00',
        metadata: { note: '', end_time: '2025-01-15T23:30:00' } satisfies SleepMetadata,
      }),
    ]
    const result = aggregateSleepDuration(activities, range)
    expect(result[0].minutes).toBe(150) // 2.5 hours
  })

  it('skips sleep records without end_time', () => {
    const range = getDateRange('daily', new Date('2025-01-15'))
    const activities = [
      createMockActivity({
        type: 'sleep',
        recorded_at: '2025-01-15T21:00:00',
        metadata: { note: '', end_time: null } satisfies SleepMetadata,
      }),
    ]
    const result = aggregateSleepDuration(activities, range)
    expect(result[0].minutes).toBe(0)
  })

  it('sums multiple sleep sessions in a day', () => {
    const range = getDateRange('daily', new Date('2025-01-15'))
    const activities = [
      createMockActivity({
        type: 'sleep',
        recorded_at: '2025-01-15T13:00:00',
        metadata: { note: '낮잠', end_time: '2025-01-15T14:00:00' } satisfies SleepMetadata,
      }),
      createMockActivity({
        type: 'sleep',
        recorded_at: '2025-01-15T21:00:00',
        metadata: { note: '', end_time: '2025-01-15T23:00:00' } satisfies SleepMetadata,
      }),
    ]
    const result = aggregateSleepDuration(activities, range)
    expect(result[0].minutes).toBe(180) // 60 + 120
  })

  it('ignores non-sleep activities', () => {
    const range = getDateRange('daily', new Date('2025-01-15'))
    const activities = [
      createMockActivity({ type: 'drink', recorded_at: '2025-01-15T08:00:00' }),
    ]
    const result = aggregateSleepDuration(activities, range)
    expect(result[0].minutes).toBe(0)
  })
})

describe('ACTIVITY_CHART_COLORS', () => {
  it('has color for every activity type', () => {
    expect(ACTIVITY_CHART_COLORS.solid_food).toBeDefined()
    expect(ACTIVITY_CHART_COLORS.drink).toBeDefined()
    expect(ACTIVITY_CHART_COLORS.supplement).toBeDefined()
    expect(ACTIVITY_CHART_COLORS.diaper).toBeDefined()
    expect(ACTIVITY_CHART_COLORS.sleep).toBeDefined()
  })
})

describe('DRINK_CHART_COLORS', () => {
  it('has color for every drink type', () => {
    expect(DRINK_CHART_COLORS.formula).toBeDefined()
    expect(DRINK_CHART_COLORS.milk).toBeDefined()
    expect(DRINK_CHART_COLORS.water).toBeDefined()
  })
})

describe('formatXAxisLabel', () => {
  it('formats daily as HH시', () => {
    const label = formatXAxisLabel('2025-06-15', 'daily')
    expect(label).toMatch(/시$/)
  })

  it('formats weekly as day of week', () => {
    const label = formatXAxisLabel('2025-06-15', 'weekly')
    expect(label).toBeTruthy()
  })

  it('formats monthly as day number', () => {
    const label = formatXAxisLabel('2025-06-15', 'monthly')
    expect(label).toBe('15')
  })
})
