import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useFamilyStore } from './familyStore'
import { supabase } from '@/lib/supabase'
import { FAMILY_CODE_KEY, FAMILY_PASSWORD_KEY } from '@/lib/constants'
import { resetAllStores } from '@/test/helpers/zustandTestUtils'

const mockFrom = supabase.from as ReturnType<typeof vi.fn>
const mockRpc = supabase.rpc as ReturnType<typeof vi.fn>

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
      localStorage.setItem(FAMILY_PASSWORD_KEY, '1234')

      let rpcCallCount = 0
      mockRpc.mockImplementation(() => {
        rpcCallCount++
        if (rpcCallCount === 1) {
          return Promise.resolve({ data: [{ id: 'fam-id', code: 'TESTCODE' }], error: null })
        }
        return Promise.resolve({ data: null, error: null })
      })

      mockFrom.mockReturnValue(
        mockQueryBuilder({
          single: vi.fn().mockResolvedValue({ data: { id: 'dev-id' }, error: null }),
        }),
      )

      await useFamilyStore.getState().initialize()
      expect(useFamilyStore.getState().familyId).toBe('fam-id')
      expect(useFamilyStore.getState().familyCode).toBe('TESTCODE')
      expect(useFamilyStore.getState().familyPassword).toBe('1234')
      expect(useFamilyStore.getState().initialized).toBe(true)
    })

    it('clears localStorage when family not found', async () => {
      localStorage.setItem(FAMILY_CODE_KEY, 'INVALID')
      localStorage.setItem(FAMILY_PASSWORD_KEY, '1234')

      mockRpc.mockResolvedValue({ data: [], error: null })

      await useFamilyStore.getState().initialize()
      expect(localStorage.getItem(FAMILY_CODE_KEY)).toBeNull()
      expect(localStorage.getItem(FAMILY_PASSWORD_KEY)).toBeNull()
      expect(useFamilyStore.getState().familyId).toBeNull()
      expect(useFamilyStore.getState().initialized).toBe(true)
    })

    it('clears localStorage when device not registered', async () => {
      localStorage.setItem(FAMILY_CODE_KEY, 'TESTCODE')
      localStorage.setItem(FAMILY_PASSWORD_KEY, '1234')

      mockRpc.mockResolvedValue({ data: [{ id: 'fam-id', code: 'TESTCODE' }], error: null })
      mockFrom.mockReturnValue(
        mockQueryBuilder({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      )

      await useFamilyStore.getState().initialize()
      expect(localStorage.getItem(FAMILY_CODE_KEY)).toBeNull()
      expect(localStorage.getItem(FAMILY_PASSWORD_KEY)).toBeNull()
      expect(useFamilyStore.getState().familyId).toBeNull()
    })
  })

  describe('checkFamilyExists', () => {
    it('returns true when family exists', async () => {
      mockRpc.mockResolvedValue({ data: [{ id: 'fam-id', code: 'TESTCODE' }], error: null })

      const exists = await useFamilyStore.getState().checkFamilyExists('TESTCODE')
      expect(exists).toBe(true)
    })

    it('returns false when family does not exist', async () => {
      mockRpc.mockResolvedValue({ data: [], error: null })

      const exists = await useFamilyStore.getState().checkFamilyExists('UNKNOWN')
      expect(exists).toBe(false)
    })
  })

  describe('joinOrCreate', () => {
    it('creates new family when code does not exist', async () => {
      let rpcCallCount = 0
      mockRpc.mockImplementation(() => {
        rpcCallCount++
        if (rpcCallCount === 1) {
          // get_family_by_code — not found
          return Promise.resolve({ data: [], error: null })
        }
        // create_family
        return Promise.resolve({ data: [{ id: 'new-fam', code: 'NEWCODE' }], error: null })
      })

      mockFrom.mockReturnValue(mockQueryBuilder()) // device upsert

      await useFamilyStore.getState().joinOrCreate('newcode')
      expect(useFamilyStore.getState().familyId).toBe('new-fam')
      expect(useFamilyStore.getState().familyCode).toBe('NEWCODE')
      expect(localStorage.getItem(FAMILY_CODE_KEY)).toBe('NEWCODE')
      expect(localStorage.getItem(FAMILY_PASSWORD_KEY)).toBeTruthy()
    })

    it('joins existing family with correct password', async () => {
      let rpcCallCount = 0
      mockRpc.mockImplementation(() => {
        rpcCallCount++
        if (rpcCallCount === 1) {
          // get_family_by_code — found
          return Promise.resolve({ data: [{ id: 'exist-fam', code: 'EXIST' }], error: null })
        }
        // verify_family — password correct
        return Promise.resolve({ data: [{ id: 'exist-fam', code: 'EXIST' }], error: null })
      })

      mockFrom.mockReturnValue(mockQueryBuilder()) // device upsert

      await useFamilyStore.getState().joinOrCreate('EXIST', '1234')
      expect(useFamilyStore.getState().familyId).toBe('exist-fam')
      expect(localStorage.getItem(FAMILY_PASSWORD_KEY)).toBe('1234')
    })

    it('throws on wrong password', async () => {
      let rpcCallCount = 0
      mockRpc.mockImplementation(() => {
        rpcCallCount++
        if (rpcCallCount === 1) {
          // get_family_by_code — found
          return Promise.resolve({ data: [{ id: 'exist-fam', code: 'EXIST' }], error: null })
        }
        // verify_family — password wrong → empty result
        return Promise.resolve({ data: [], error: null })
      })

      await expect(
        useFamilyStore.getState().joinOrCreate('EXIST', '9999'),
      ).rejects.toThrow('비밀번호가 일치하지 않습니다.')
    })

    it('throws when family creation fails', async () => {
      let rpcCallCount = 0
      mockRpc.mockImplementation(() => {
        rpcCallCount++
        if (rpcCallCount === 1) {
          // get_family_by_code — not found
          return Promise.resolve({ data: [], error: null })
        }
        // create_family — error
        return Promise.resolve({ data: null, error: { message: 'fail' } })
      })

      await expect(
        useFamilyStore.getState().joinOrCreate('NEWCODE'),
      ).rejects.toThrow('가족방 생성에 실패했습니다.')
    })

    it('converts code to uppercase', async () => {
      let rpcCallCount = 0
      mockRpc.mockImplementation(() => {
        rpcCallCount++
        if (rpcCallCount === 1) {
          return Promise.resolve({ data: [], error: null })
        }
        return Promise.resolve({ data: [{ id: 'new-fam', code: 'LOWER' }], error: null })
      })

      mockFrom.mockReturnValue(mockQueryBuilder())

      await useFamilyStore.getState().joinOrCreate('lower')
      expect(useFamilyStore.getState().familyCode).toBe('LOWER')
    })
  })

  describe('updatePassword', () => {
    it('updates password in store and localStorage', async () => {
      useFamilyStore.setState({ familyId: 'fam-1', familyPassword: '1234' })
      localStorage.setItem(FAMILY_PASSWORD_KEY, '1234')
      mockRpc.mockResolvedValue({ data: null, error: null })

      await useFamilyStore.getState().updatePassword('5678')
      expect(useFamilyStore.getState().familyPassword).toBe('5678')
      expect(localStorage.getItem(FAMILY_PASSWORD_KEY)).toBe('5678')
    })

    it('does nothing when no familyId', async () => {
      useFamilyStore.setState({ familyId: null })
      await useFamilyStore.getState().updatePassword('5678')
      expect(useFamilyStore.getState().familyPassword).toBeNull()
    })

    it('throws on error', async () => {
      useFamilyStore.setState({ familyId: 'fam-1' })
      mockRpc.mockResolvedValue({ data: null, error: { message: 'fail' } })

      await expect(
        useFamilyStore.getState().updatePassword('5678'),
      ).rejects.toThrow('비밀번호 변경에 실패했습니다.')
    })
  })

  describe('leave', () => {
    it('deletes device and clears store state', async () => {
      useFamilyStore.setState({
        familyId: 'fam-1',
        familyCode: 'TESTCODE',
        familyPassword: '1234',
      })
      localStorage.setItem(FAMILY_CODE_KEY, 'TESTCODE')
      localStorage.setItem(FAMILY_PASSWORD_KEY, '1234')

      mockFrom.mockReturnValue(mockQueryBuilder())

      await useFamilyStore.getState().leave()
      expect(useFamilyStore.getState().familyId).toBeNull()
      expect(useFamilyStore.getState().familyCode).toBeNull()
      expect(useFamilyStore.getState().familyPassword).toBeNull()
      expect(localStorage.getItem(FAMILY_CODE_KEY)).toBeNull()
      expect(localStorage.getItem(FAMILY_PASSWORD_KEY)).toBeNull()
    })
  })

  describe('deleteFamily', () => {
    it('throws on wrong password and keeps state', async () => {
      useFamilyStore.setState({
        familyId: 'fam-1',
        familyCode: 'TESTCODE',
        familyPassword: '1234',
      })

      mockRpc.mockResolvedValue({ data: false, error: null })

      await expect(
        useFamilyStore.getState().deleteFamily('9999'),
      ).rejects.toThrow('비밀번호가 일치하지 않습니다.')

      expect(useFamilyStore.getState().familyId).toBe('fam-1')
      expect(useFamilyStore.getState().familyCode).toBe('TESTCODE')
    })

    it('deletes family and clears state on correct password', async () => {
      useFamilyStore.setState({
        familyId: 'fam-1',
        familyCode: 'TESTCODE',
        familyPassword: '1234',
      })
      localStorage.setItem(FAMILY_CODE_KEY, 'TESTCODE')
      localStorage.setItem(FAMILY_PASSWORD_KEY, '1234')

      mockRpc.mockResolvedValue({ data: true, error: null })

      await useFamilyStore.getState().deleteFamily('1234')
      expect(useFamilyStore.getState().familyId).toBeNull()
      expect(useFamilyStore.getState().familyCode).toBeNull()
      expect(useFamilyStore.getState().familyPassword).toBeNull()
      expect(localStorage.getItem(FAMILY_CODE_KEY)).toBeNull()
      expect(localStorage.getItem(FAMILY_PASSWORD_KEY)).toBeNull()
    })

    it('throws on RPC error', async () => {
      useFamilyStore.setState({ familyId: 'fam-1', familyCode: 'TESTCODE' })
      mockRpc.mockResolvedValue({ data: null, error: { message: 'db error' } })

      await expect(
        useFamilyStore.getState().deleteFamily('1234'),
      ).rejects.toThrow('가족방 삭제에 실패했습니다.')
    })
  })
})
