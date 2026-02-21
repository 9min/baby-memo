import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSupplementStore } from './supplementStore'
import { supabase } from '@/lib/supabase'
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

describe('supplementStore', () => {
  beforeEach(() => {
    resetAllStores()
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('starts with empty presets', () => {
      expect(useSupplementStore.getState().presets).toEqual([])
    })

    it('starts with loading false', () => {
      expect(useSupplementStore.getState().loading).toBe(false)
    })
  })

  describe('fetchPresets', () => {
    it('stores fetched presets', async () => {
      const presets = [
        { id: 'p1', family_id: 'fam-1', name: '비타민D', created_at: '2025-01-01' },
        { id: 'p2', family_id: 'fam-1', name: '오메가3', created_at: '2025-01-01' },
      ]

      mockFrom.mockReturnValue(
        mockQueryBuilder({
          order: vi.fn().mockResolvedValue({ data: presets, error: null }),
        }),
      )

      await useSupplementStore.getState().fetchPresets('fam-1')
      expect(useSupplementStore.getState().presets).toHaveLength(2)
      expect(useSupplementStore.getState().loading).toBe(false)
    })

    it('sets loading during fetch', async () => {
      mockFrom.mockReturnValue(mockQueryBuilder())

      const promise = useSupplementStore.getState().fetchPresets('fam-1')
      expect(useSupplementStore.getState().loading).toBe(true)
      await promise
      expect(useSupplementStore.getState().loading).toBe(false)
    })

    it('defaults to empty array when data is null', async () => {
      mockFrom.mockReturnValue(
        mockQueryBuilder({
          order: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      )

      await useSupplementStore.getState().fetchPresets('fam-1')
      expect(useSupplementStore.getState().presets).toEqual([])
    })
  })

  describe('addPreset', () => {
    it('calls supabase insert', async () => {
      mockFrom.mockReturnValue(
        mockQueryBuilder({
          insert: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      )

      await useSupplementStore.getState().addPreset('fam-1', '비타민D')
      expect(mockFrom).toHaveBeenCalledWith('supplement_presets')
    })

    it('throws on error', async () => {
      mockFrom.mockReturnValue(
        mockQueryBuilder({
          insert: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'fail' },
          }),
        }),
      )

      await expect(
        useSupplementStore.getState().addPreset('fam-1', '비타민D'),
      ).rejects.toThrow('영양제 추가에 실패했습니다.')
    })
  })

  describe('deletePreset', () => {
    it('calls supabase delete', async () => {
      mockFrom.mockReturnValue(
        mockQueryBuilder({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      )

      await useSupplementStore.getState().deletePreset('p1')
      expect(mockFrom).toHaveBeenCalledWith('supplement_presets')
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
        useSupplementStore.getState().deletePreset('p1'),
      ).rejects.toThrow('영양제 삭제에 실패했습니다.')
    })
  })

  describe('subscribe / unsubscribe', () => {
    it('creates a channel', () => {
      useSupplementStore.getState().subscribe('fam-1')
      expect(supabase.channel).toHaveBeenCalledWith('supplement_presets:fam-1')
      expect(useSupplementStore.getState().channel).toBeTruthy()
    })

    it('removes existing channel before creating new', () => {
      const mockChannel = { on: vi.fn().mockReturnThis(), subscribe: vi.fn() }
      useSupplementStore.setState({ channel: mockChannel as never })

      useSupplementStore.getState().subscribe('fam-1')
      expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel)
    })

    it('unsubscribe removes channel', () => {
      const mockChannel = { on: vi.fn().mockReturnThis(), subscribe: vi.fn() }
      useSupplementStore.setState({ channel: mockChannel as never })

      useSupplementStore.getState().unsubscribe()
      expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel)
      expect(useSupplementStore.getState().channel).toBeNull()
    })

    it('unsubscribe does nothing when no channel', () => {
      useSupplementStore.setState({ channel: null })
      useSupplementStore.getState().unsubscribe()
      expect(supabase.removeChannel).not.toHaveBeenCalled()
    })
  })
})
