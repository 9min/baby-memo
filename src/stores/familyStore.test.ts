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

    it('starts with null nickname', () => {
      expect(useFamilyStore.getState().nickname).toBeNull()
    })

    it('starts with empty members', () => {
      expect(useFamilyStore.getState().members).toEqual([])
    })
  })

  describe('initialize', () => {
    it('sets initialized to true when no saved code', async () => {
      await useFamilyStore.getState().initialize()
      expect(useFamilyStore.getState().initialized).toBe(true)
      expect(useFamilyStore.getState().familyId).toBeNull()
    })

    it('restores family from localStorage when valid (with existing nickname)', async () => {
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
        } else if (callCount === 2) {
          // Device lookup (now selects id, nickname)
          return mockQueryBuilder({
            single: vi.fn().mockResolvedValue({
              data: { id: 'dev-id', nickname: '귀여운 토끼' },
              error: null,
            }),
          })
        } else {
          // fetchMembers
          return mockQueryBuilder({
            order: vi.fn().mockResolvedValue({
              data: [{ id: 'dev-id', device_id: 'test-device', family_id: 'fam-id', nickname: '귀여운 토끼', created_at: '2025-01-01' }],
              error: null,
            }),
          })
        }
      })

      await useFamilyStore.getState().initialize()
      expect(useFamilyStore.getState().familyId).toBe('fam-id')
      expect(useFamilyStore.getState().familyCode).toBe('TESTCODE')
      expect(useFamilyStore.getState().nickname).toBe('귀여운 토끼')
      expect(useFamilyStore.getState().initialized).toBe(true)
    })

    it('auto-generates nickname when device has no nickname', async () => {
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
        } else if (callCount === 2) {
          // Device lookup — nickname is null
          return mockQueryBuilder({
            single: vi.fn().mockResolvedValue({
              data: { id: 'dev-id', nickname: null },
              error: null,
            }),
          })
        } else if (callCount === 3) {
          // Fetch existing nicknames for generation
          return mockQueryBuilder({
            eq: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          })
        } else if (callCount === 4) {
          // Update device with generated nickname
          return mockQueryBuilder()
        } else {
          // fetchMembers
          return mockQueryBuilder({
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
          })
        }
      })

      await useFamilyStore.getState().initialize()
      expect(useFamilyStore.getState().nickname).toBeTruthy()
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
        } else if (callCount === 3) {
          // Fetch existing nicknames
          return mockQueryBuilder({
            eq: vi.fn().mockResolvedValue({ data: [], error: null }),
          })
        } else if (callCount === 4) {
          // Upsert device
          return mockQueryBuilder()
        } else {
          // fetchMembers
          return mockQueryBuilder({
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
          })
        }
      })

      await useFamilyStore.getState().joinOrCreate('newcode')
      expect(useFamilyStore.getState().familyId).toBe('new-fam')
      expect(useFamilyStore.getState().familyCode).toBe('NEWCODE')
      expect(useFamilyStore.getState().nickname).toBeTruthy()
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
        } else if (callCount === 2) {
          // Fetch existing nicknames
          return mockQueryBuilder({
            eq: vi.fn().mockResolvedValue({ data: [], error: null }),
          })
        } else {
          return mockQueryBuilder({
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
          })
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
        } else if (callCount === 3) {
          // Fetch existing nicknames
          return mockQueryBuilder({
            eq: vi.fn().mockResolvedValue({ data: [], error: null }),
          })
        } else {
          return mockQueryBuilder({
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
          })
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
    it('clears store state including nickname and members', async () => {
      useFamilyStore.setState({
        familyId: 'fam-1',
        familyCode: 'TESTCODE',
        familyPassword: '1234',
        nickname: '귀여운 토끼',
        members: [{ id: '1', device_id: 'dev-1', family_id: 'fam-1', nickname: '귀여운 토끼', created_at: '2025-01-01', updated_at: '2025-01-01' }],
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
      expect(useFamilyStore.getState().nickname).toBeNull()
      expect(useFamilyStore.getState().members).toEqual([])
      expect(localStorage.getItem(FAMILY_CODE_KEY)).toBeNull()
    })
  })

  describe('setNickname', () => {
    it('updates nickname in store', async () => {
      useFamilyStore.setState({ familyId: 'fam-1', deviceId: 'dev-1', nickname: '귀여운 토끼' })
      mockFrom.mockReturnValue(mockQueryBuilder())

      await useFamilyStore.getState().setNickname('용감한 펭귄')
      expect(useFamilyStore.getState().nickname).toBe('용감한 펭귄')
    })

    it('does nothing when no familyId', async () => {
      useFamilyStore.setState({ familyId: null, nickname: null })
      await useFamilyStore.getState().setNickname('용감한 펭귄')
      expect(useFamilyStore.getState().nickname).toBeNull()
    })

    it('throws on error', async () => {
      useFamilyStore.setState({ familyId: 'fam-1', deviceId: 'dev-1' })
      const eqSecond = vi.fn().mockResolvedValue({ data: null, error: { message: 'fail' } })
      mockFrom.mockReturnValue(
        mockQueryBuilder({
          eq: vi.fn().mockReturnValue({ eq: eqSecond }),
        }),
      )

      await expect(
        useFamilyStore.getState().setNickname('용감한 펭귄'),
      ).rejects.toThrow('닉네임 변경에 실패했습니다.')
    })
  })

  describe('kickMember', () => {
    it('successfully kicks another member when room owner', async () => {
      useFamilyStore.setState({
        familyId: 'fam-1',
        deviceId: 'dev-owner',
        members: [
          { id: '1', device_id: 'dev-owner', family_id: 'fam-1', nickname: '방장', created_at: '2025-01-01', updated_at: '2025-01-01' },
          { id: '2', device_id: 'dev-target', family_id: 'fam-1', nickname: '멤버', created_at: '2025-01-02', updated_at: '2025-01-02' },
        ],
      })

      const eqSecond = vi.fn().mockResolvedValue({ data: null, error: null })
      let callCount = 0
      mockFrom.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // delete().eq().eq()
          return mockQueryBuilder({
            eq: vi.fn().mockReturnValue({ eq: eqSecond }),
          })
        }
        // fetchMembers
        return mockQueryBuilder({
          order: vi.fn().mockResolvedValue({
            data: [{ id: '1', device_id: 'dev-owner', family_id: 'fam-1', nickname: '방장', created_at: '2025-01-01', updated_at: '2025-01-01' }],
            error: null,
          }),
        })
      })

      await useFamilyStore.getState().kickMember('dev-target')
      expect(mockFrom).toHaveBeenCalledWith('devices')
      expect(useFamilyStore.getState().members).toHaveLength(1)
    })

    it('throws when non-owner tries to kick', async () => {
      useFamilyStore.setState({
        familyId: 'fam-1',
        deviceId: 'dev-member',
        members: [
          { id: '1', device_id: 'dev-owner', family_id: 'fam-1', nickname: '방장', created_at: '2025-01-01', updated_at: '2025-01-01' },
          { id: '2', device_id: 'dev-member', family_id: 'fam-1', nickname: '멤버', created_at: '2025-01-02', updated_at: '2025-01-02' },
        ],
      })

      await expect(
        useFamilyStore.getState().kickMember('dev-owner'),
      ).rejects.toThrow('방장만 구성원을 내보낼 수 있습니다.')
    })

    it('throws when trying to kick self', async () => {
      useFamilyStore.setState({
        familyId: 'fam-1',
        deviceId: 'dev-owner',
        members: [
          { id: '1', device_id: 'dev-owner', family_id: 'fam-1', nickname: '방장', created_at: '2025-01-01', updated_at: '2025-01-01' },
        ],
      })

      await expect(
        useFamilyStore.getState().kickMember('dev-owner'),
      ).rejects.toThrow('자기 자신을 내보낼 수 없습니다.')
    })

    it('does nothing when no familyId', async () => {
      useFamilyStore.setState({ familyId: null })
      await useFamilyStore.getState().kickMember('dev-target')
      expect(mockFrom).not.toHaveBeenCalled()
    })

    it('throws when supabase delete fails', async () => {
      useFamilyStore.setState({
        familyId: 'fam-1',
        deviceId: 'dev-owner',
        members: [
          { id: '1', device_id: 'dev-owner', family_id: 'fam-1', nickname: '방장', created_at: '2025-01-01', updated_at: '2025-01-01' },
          { id: '2', device_id: 'dev-target', family_id: 'fam-1', nickname: '멤버', created_at: '2025-01-02', updated_at: '2025-01-02' },
        ],
      })

      const eqSecond = vi.fn().mockResolvedValue({ data: null, error: { message: 'fail' } })
      mockFrom.mockReturnValue(
        mockQueryBuilder({
          eq: vi.fn().mockReturnValue({ eq: eqSecond }),
        }),
      )

      await expect(
        useFamilyStore.getState().kickMember('dev-target'),
      ).rejects.toThrow('구성원 내보내기에 실패했습니다.')
    })
  })

  describe('fetchMembers', () => {
    it('sets members from supabase response', async () => {
      const mockMembers = [
        { id: '1', device_id: 'dev-1', family_id: 'fam-1', nickname: '귀여운 토끼', created_at: '2025-01-01', updated_at: '2025-01-01' },
        { id: '2', device_id: 'dev-2', family_id: 'fam-1', nickname: '용감한 펭귄', created_at: '2025-01-02', updated_at: '2025-01-02' },
      ]
      mockFrom.mockReturnValue(
        mockQueryBuilder({
          order: vi.fn().mockResolvedValue({ data: mockMembers, error: null }),
        }),
      )

      await useFamilyStore.getState().fetchMembers('fam-1')
      expect(useFamilyStore.getState().members).toEqual(mockMembers)
    })
  })
})
