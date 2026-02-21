import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useStatsStore } from './statsStore'
import { supabase } from '@/lib/supabase'

const mockFrom = vi.mocked(supabase.from)

describe('statsStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T12:00:00'))

    const now = new Date()
    useStatsStore.setState({
      period: 'daily',
      anchorDate: now,
      dateRange: { start: new Date('2025-06-15T00:00:00'), end: new Date('2025-06-15T23:59:59.999') },
      rawActivities: [],
      activityCounts: [],
      drinkIntakes: [],
      sleepDurations: [],
      loading: false,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('has initial state', () => {
    const state = useStatsStore.getState()
    expect(state.period).toBe('daily')
    expect(state.loading).toBe(false)
    expect(state.rawActivities).toEqual([])
  })

  it('setPeriod updates period and dateRange', () => {
    useStatsStore.getState().setPeriod('weekly')
    const state = useStatsStore.getState()
    expect(state.period).toBe('weekly')
    // Weekly range should have start on Monday
    expect(state.dateRange.start.getDay()).toBe(1)
  })

  it('navigatePrev moves anchor date backward', () => {
    useStatsStore.getState().navigatePrev()
    const state = useStatsStore.getState()
    expect(state.anchorDate.getDate()).toBe(14)
  })

  it('navigateNext moves anchor date forward', () => {
    useStatsStore.getState().navigateNext()
    const state = useStatsStore.getState()
    expect(state.anchorDate.getDate()).toBe(16)
  })

  it('navigatePrev respects current period (weekly)', () => {
    useStatsStore.getState().setPeriod('weekly')
    useStatsStore.getState().navigatePrev()
    const state = useStatsStore.getState()
    // Should go back 7 days
    expect(state.anchorDate.getDate()).toBe(8)
  })

  it('goToToday resets to current date', () => {
    useStatsStore.getState().navigatePrev()
    useStatsStore.getState().navigatePrev()
    useStatsStore.getState().goToToday()
    const state = useStatsStore.getState()
    expect(state.anchorDate.getDate()).toBe(15)
  })

  it('fetchStats queries supabase and computes aggregates', async () => {
    const mockData = [
      {
        id: 'a1',
        family_id: 'fam-1',
        device_id: 'dev-1',
        type: 'solid_food',
        recorded_at: '2025-06-15T08:00:00',
        memo: null,
        metadata: { food_name: '감자죽' },
        created_at: '2025-06-15T08:00:00',
      },
    ]

    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    }

    mockFrom.mockReturnValue(mockChain as never)

    await useStatsStore.getState().fetchStats('fam-1')

    const state = useStatsStore.getState()
    expect(state.loading).toBe(false)
    expect(state.rawActivities).toHaveLength(1)
    expect(state.activityCounts).toHaveLength(1)
    expect(state.activityCounts[0].total).toBe(1)
    expect(mockFrom).toHaveBeenCalledWith('activities')
  })

  it('fetchStats sets loading to true during fetch', () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnValue(new Promise(() => {})), // never resolves
    }
    mockFrom.mockReturnValue(mockChain as never)

    useStatsStore.getState().fetchStats('fam-1')
    expect(useStatsStore.getState().loading).toBe(true)
  })

  it('fetchStats handles null data', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: null }),
    }
    mockFrom.mockReturnValue(mockChain as never)

    await useStatsStore.getState().fetchStats('fam-1')
    const state = useStatsStore.getState()
    expect(state.rawActivities).toEqual([])
    expect(state.loading).toBe(false)
  })
})
