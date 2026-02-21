import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useActivityStore } from './activityStore'
import { supabase } from '@/lib/supabase'
import { createMockActivity, resetMockActivityCounter } from '@/test/helpers/mockActivity'
import { resetAllStores } from '@/test/helpers/zustandTestUtils'

const mockFrom = supabase.from as ReturnType<typeof vi.fn>

function mockQueryBuilder(overrides: Record<string, unknown> = {}) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    ...overrides,
  }
  return builder
}

describe('activityStore', () => {
  beforeEach(() => {
    resetAllStores()
    resetMockActivityCounter()
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('starts with empty activities', () => {
      expect(useActivityStore.getState().activities).toEqual([])
    })

    it('starts with loading false', () => {
      expect(useActivityStore.getState().loading).toBe(false)
    })

    it('starts with current date as selectedDate', () => {
      const now = new Date()
      const selected = useActivityStore.getState().selectedDate
      expect(selected.getDate()).toBe(now.getDate())
    })
  })

  describe('setSelectedDate', () => {
    it('updates selectedDate', () => {
      const date = new Date('2025-01-15')
      useActivityStore.getState().setSelectedDate(date)
      expect(useActivityStore.getState().selectedDate).toBe(date)
    })
  })

  describe('fetchActivities', () => {
    it('sets loading true then false after fetch', async () => {
      mockFrom.mockReturnValue(mockQueryBuilder())

      const promise = useActivityStore.getState().fetchActivities('fam-1', new Date('2025-01-15'))
      expect(useActivityStore.getState().loading).toBe(true)

      await promise
      expect(useActivityStore.getState().loading).toBe(false)
    })

    it('stores fetched activities', async () => {
      const activities = [
        createMockActivity({ id: 'a1' }),
        createMockActivity({ id: 'a2' }),
      ]

      mockFrom.mockReturnValue(
        mockQueryBuilder({
          order: vi.fn().mockResolvedValue({ data: activities, error: null }),
        }),
      )

      await useActivityStore.getState().fetchActivities('fam-1', new Date('2025-01-15'))
      expect(useActivityStore.getState().activities).toHaveLength(2)
    })

    it('sets empty array when data is null', async () => {
      mockFrom.mockReturnValue(
        mockQueryBuilder({
          order: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      )

      await useActivityStore.getState().fetchActivities('fam-1', new Date('2025-01-15'))
      expect(useActivityStore.getState().activities).toEqual([])
    })
  })

  describe('recordActivity', () => {
    it('calls supabase insert', async () => {
      const insertMock = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      })
      mockFrom.mockReturnValue(
        mockQueryBuilder({ insert: insertMock }),
      )

      await useActivityStore.getState().recordActivity({
        familyId: 'fam-1',
        deviceId: 'dev-1',
        type: 'solid_food',
        recordedAt: new Date().toISOString(),
        metadata: { food_name: '감자죽' },
      })

      expect(mockFrom).toHaveBeenCalledWith('activities')
    })

    it('throws on error', async () => {
      mockFrom.mockReturnValue({
        insert: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'fail' },
        }),
      })

      await expect(
        useActivityStore.getState().recordActivity({
          familyId: 'fam-1',
          deviceId: 'dev-1',
          type: 'solid_food',
          recordedAt: new Date().toISOString(),
          metadata: { food_name: '감자죽' },
        }),
      ).rejects.toThrow('활동 기록에 실패했습니다.')
    })
  })

  describe('updateActivity', () => {
    it('calls supabase update', async () => {
      mockFrom.mockReturnValue(
        mockQueryBuilder({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      )

      await useActivityStore.getState().updateActivity({
        activityId: 'a1',
        recordedAt: new Date().toISOString(),
        metadata: { food_name: '바나나' },
      })

      expect(mockFrom).toHaveBeenCalledWith('activities')
    })

    it('throws on error', async () => {
      mockFrom.mockReturnValue(
        mockQueryBuilder({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'fail' },
          }),
        }),
      )

      await expect(
        useActivityStore.getState().updateActivity({
          activityId: 'a1',
          recordedAt: new Date().toISOString(),
          metadata: { food_name: '바나나' },
        }),
      ).rejects.toThrow('활동 수정에 실패했습니다.')
    })
  })

  describe('deleteActivity', () => {
    it('optimistically removes activity from state', async () => {
      const activities = [
        createMockActivity({ id: 'a1' }),
        createMockActivity({ id: 'a2' }),
      ]
      useActivityStore.setState({ activities })

      mockFrom.mockReturnValue(
        mockQueryBuilder({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      )

      await useActivityStore.getState().deleteActivity('a1')
      expect(useActivityStore.getState().activities).toHaveLength(1)
      expect(useActivityStore.getState().activities[0].id).toBe('a2')
    })

    it('optimistically removes activity from recentActivities', async () => {
      const activities = [
        createMockActivity({ id: 'a1' }),
        createMockActivity({ id: 'a2' }),
      ]
      useActivityStore.setState({ activities, recentActivities: activities })

      mockFrom.mockReturnValue(
        mockQueryBuilder({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      )

      await useActivityStore.getState().deleteActivity('a1')
      expect(useActivityStore.getState().recentActivities).toHaveLength(1)
      expect(useActivityStore.getState().recentActivities[0].id).toBe('a2')
    })

    it('rolls back on error', async () => {
      const activities = [
        createMockActivity({ id: 'a1' }),
        createMockActivity({ id: 'a2' }),
      ]
      useActivityStore.setState({ activities, recentActivities: activities })

      mockFrom.mockReturnValue(
        mockQueryBuilder({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'fail' },
          }),
        }),
      )

      await expect(
        useActivityStore.getState().deleteActivity('a1'),
      ).rejects.toThrow('활동 삭제에 실패했습니다.')

      expect(useActivityStore.getState().activities).toHaveLength(2)
      expect(useActivityStore.getState().recentActivities).toHaveLength(2)
    })
  })

  describe('subscribe / unsubscribe', () => {
    it('creates a channel and stores it', () => {
      useActivityStore.getState().subscribe('fam-1')
      expect(supabase.channel).toHaveBeenCalledWith('activities:fam-1')
      expect(useActivityStore.getState().channel).toBeTruthy()
    })

    it('removes existing channel before creating new one', () => {
      const mockChannel = { on: vi.fn().mockReturnThis(), subscribe: vi.fn() }
      useActivityStore.setState({ channel: mockChannel as never })

      useActivityStore.getState().subscribe('fam-1')
      expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel)
    })

    it('unsubscribe removes channel', () => {
      const mockChannel = { on: vi.fn().mockReturnThis(), subscribe: vi.fn() }
      useActivityStore.setState({ channel: mockChannel as never })

      useActivityStore.getState().unsubscribe()
      expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel)
      expect(useActivityStore.getState().channel).toBeNull()
    })

    it('unsubscribe does nothing when no channel', () => {
      useActivityStore.setState({ channel: null })
      useActivityStore.getState().unsubscribe()
      expect(supabase.removeChannel).not.toHaveBeenCalled()
    })
  })
})
