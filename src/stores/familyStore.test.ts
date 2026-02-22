import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useFamilyStore } from './familyStore'
import { supabase } from '@/lib/supabase'
import { FAMILY_CODE_KEY } from '@/lib/constants'
import { resetAllStores } from '@/test/helpers/zustandTestUtils'

// Cast supabase.from to mock for test manipulation
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
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    ...overrides,
  }
  return builder
}

describe('familyStore', () => {
  beforeEach(() => {
    resetAllStores()
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('starts with null familyId', () => {
      expect(useFamilyStore.getState().familyId).toBeNull()
    })

    it('starts with initialized false', () => {
      expect(useFamilyStore.getState().initialized).toBe(false)
    })

    it('has a deviceId', () => {
      expect(useFamilyStore.getState().deviceId).toBeTruthy()
    })
  })

  describe('initialize', () => {
    it('sets initialized to true when no saved code', async () => {
      await useFamilyStore.getState().initialize()
      expect(useFamilyStore.getState().initialized).toBe(true)
      expect(useFamilyStore.getState().familyId).toBeNull()
    })

    it('restores family from localStorage when valid', async () => {
      localStorage.setItem(FAMILY_CODE_KEY, 'TESTCODE')

      let callCount = 0
      mockFrom.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // Family lookup
          return mockQueryBuilder({
            single: vi.fn().mockResolvedValue({
              data: { id: 'fam-id', code: 'TESTCODE', password: '1234' },
              error: null,
            }),
          })
        } else {
          // Device lookup
          return mockQueryBuilder({
            single: vi.fn().mockResolvedValue({
              data: { id: 'dev-id' },
              error: null,
            }),
          })
        }
      })

      await useFamilyStore.getState().initialize()
      expect(useFamilyStore.getState().familyId).toBe('fam-id')
      expect(useFamilyStore.getState().familyCode).toBe('TESTCODE')
      expect(useFamilyStore.getState().initialized).toBe(true)
    })

    it('clears localStorage when family not found', async () => {
      localStorage.setItem(FAMILY_CODE_KEY, 'INVALID')

      mockFrom.mockReturnValue(
        mockQueryBuilder({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      )

      await useFamilyStore.getState().initialize()
      expect(localStorage.getItem(FAMILY_CODE_KEY)).toBeNull()
      expect(useFamilyStore.getState().familyId).toBeNull()
      expect(useFamilyStore.getState().initialized).toBe(true)
    })

    it('clears localStorage when device not registered', async () => {
      localStorage.setItem(FAMILY_CODE_KEY, 'TESTCODE')

      let callCount = 0
      mockFrom.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return mockQueryBuilder({
            single: vi.fn().mockResolvedValue({
              data: { id: 'fam-id', code: 'TESTCODE', password: '1234' },
              error: null,
            }),
          })
        } else {
          return mockQueryBuilder({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          })
        }
      })

      await useFamilyStore.getState().initialize()
      expect(localStorage.getItem(FAMILY_CODE_KEY)).toBeNull()
      expect(useFamilyStore.getState().familyId).toBeNull()
    })
  })

  describe('checkFamilyExists', () => {
    it('returns true when family exists', async () => {
      mockFrom.mockReturnValue(
        mockQueryBuilder({
          single: vi.fn().mockResolvedValue({
            data: { id: 'fam-id' },
            error: null,
          }),
        }),
      )

      const exists = await useFamilyStore.getState().checkFamilyExists('TESTCODE')
      expect(exists).toBe(true)
    })

    it('returns false when family does not exist', async () => {
      mockFrom.mockReturnValue(
        mockQueryBuilder({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      )

      const exists = await useFamilyStore.getState().checkFamilyExists('UNKNOWN')
      expect(exists).toBe(false)
    })
  })

  describe('joinOrCreate', () => {
    it('creates new family when code does not exist', async () => {
      let callCount = 0
      mockFrom.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // Check existing family
          return mockQueryBuilder({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          })
        } else if (callCount === 2) {
          // Create new family
          return mockQueryBuilder({
            single: vi.fn().mockResolvedValue({
              data: { id: 'new-fam', code: 'NEWCODE', password: '5678' },
              error: null,
            }),
          })
        } else {
          // Upsert device
          return mockQueryBuilder()
        }
      })

      await useFamilyStore.getState().joinOrCreate('newcode')
      expect(useFamilyStore.getState().familyId).toBe('new-fam')
      expect(useFamilyStore.getState().familyCode).toBe('NEWCODE')
      expect(localStorage.getItem(FAMILY_CODE_KEY)).toBe('NEWCODE')
    })

    it('joins existing family with correct password', async () => {
      let callCount = 0
      mockFrom.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return mockQueryBuilder({
            single: vi.fn().mockResolvedValue({
              data: { id: 'exist-fam', code: 'EXIST', password: '1234' },
              error: null,
            }),
          })
        } else {
          return mockQueryBuilder()
        }
      })

      await useFamilyStore.getState().joinOrCreate('EXIST', '1234')
      expect(useFamilyStore.getState().familyId).toBe('exist-fam')
    })

    it('throws on wrong password', async () => {
      mockFrom.mockReturnValue(
        mockQueryBuilder({
          single: vi.fn().mockResolvedValue({
            data: { id: 'exist-fam', code: 'EXIST', password: '1234' },
            error: null,
          }),
        }),
      )

      await expect(
        useFamilyStore.getState().joinOrCreate('EXIST', '9999'),
      ).rejects.toThrow('비밀번호가 일치하지 않습니다.')
    })

    it('throws when family creation fails', async () => {
      let callCount = 0
      mockFrom.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return mockQueryBuilder({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          })
        } else {
          return mockQueryBuilder({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'fail' },
            }),
          })
        }
      })

      await expect(
        useFamilyStore.getState().joinOrCreate('NEWCODE'),
      ).rejects.toThrow('가족방 생성에 실패했습니다.')
    })

    it('converts code to uppercase', async () => {
      let callCount = 0
      mockFrom.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return mockQueryBuilder({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          })
        } else if (callCount === 2) {
          return mockQueryBuilder({
            single: vi.fn().mockResolvedValue({
              data: { id: 'new-fam', code: 'LOWER', password: '1234' },
              error: null,
            }),
          })
        } else {
          return mockQueryBuilder()
        }
      })

      await useFamilyStore.getState().joinOrCreate('lower')
      expect(useFamilyStore.getState().familyCode).toBe('LOWER')
    })
  })

  describe('updatePassword', () => {
    it('updates password in store', async () => {
      useFamilyStore.setState({ familyId: 'fam-1', familyPassword: '1234' })
      mockFrom.mockReturnValue(mockQueryBuilder())

      await useFamilyStore.getState().updatePassword('5678')
      expect(useFamilyStore.getState().familyPassword).toBe('5678')
    })

    it('does nothing when no familyId', async () => {
      useFamilyStore.setState({ familyId: null })
      await useFamilyStore.getState().updatePassword('5678')
      expect(useFamilyStore.getState().familyPassword).toBeNull()
    })

    it('throws on error', async () => {
      useFamilyStore.setState({ familyId: 'fam-1' })
      mockFrom.mockReturnValue(
        mockQueryBuilder({
          eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'fail' } }),
        }),
      )

      await expect(
        useFamilyStore.getState().updatePassword('5678'),
      ).rejects.toThrow('비밀번호 변경에 실패했습니다.')
    })
  })

  describe('getDeviceCount', () => {
    it('returns 0 when no familyId', async () => {
      useFamilyStore.setState({ familyId: null })
      const count = await useFamilyStore.getState().getDeviceCount()
      expect(count).toBe(0)
    })

    it('returns count from supabase', async () => {
      useFamilyStore.setState({ familyId: 'fam-1' })
      mockFrom.mockReturnValue(
        mockQueryBuilder({
          eq: vi.fn().mockResolvedValue({ count: 3 }),
        }),
      )

      const count = await useFamilyStore.getState().getDeviceCount()
      expect(count).toBe(3)
    })
  })

  describe('leave', () => {
    it('clears store state', async () => {
      useFamilyStore.setState({
        familyId: 'fam-1',
        familyCode: 'TESTCODE',
        familyPassword: '1234',
      })
      localStorage.setItem(FAMILY_CODE_KEY, 'TESTCODE')

      let callCount = 0
      mockFrom.mockImplementation(() => {
        callCount++
        if (callCount === 2) {
          // Device count check
          return mockQueryBuilder({
            eq: vi.fn().mockResolvedValue({ count: 0 }),
          })
        }
        return mockQueryBuilder()
      })

      await useFamilyStore.getState().leave()
      expect(useFamilyStore.getState().familyId).toBeNull()
      expect(useFamilyStore.getState().familyCode).toBeNull()
      expect(useFamilyStore.getState().familyPassword).toBeNull()
      expect(localStorage.getItem(FAMILY_CODE_KEY)).toBeNull()
    })
  })
})
