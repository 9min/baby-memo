import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useFamily } from './useFamily'
import { useFamilyStore } from '@/stores/familyStore'
import { resetAllStores } from '@/test/helpers/zustandTestUtils'

describe('useFamily', () => {
  beforeEach(() => {
    resetAllStores()
  })

  it('returns initialized state', () => {
    useFamilyStore.setState({ initialized: true })
    const { result } = renderHook(() => useFamily())
    expect(result.current.initialized).toBe(true)
  })

  it('returns familyId from store', () => {
    useFamilyStore.setState({ familyId: 'fam-1', initialized: true })
    const { result } = renderHook(() => useFamily())
    expect(result.current.familyId).toBe('fam-1')
  })

  it('returns familyCode from store', () => {
    useFamilyStore.setState({ familyCode: 'TESTCODE', initialized: true })
    const { result } = renderHook(() => useFamily())
    expect(result.current.familyCode).toBe('TESTCODE')
  })

  it('returns deviceId from store', () => {
    useFamilyStore.setState({ deviceId: 'dev-1', initialized: true })
    const { result } = renderHook(() => useFamily())
    expect(result.current.deviceId).toBe('dev-1')
  })

  it('returns joinOrCreate function', () => {
    const { result } = renderHook(() => useFamily())
    expect(typeof result.current.joinOrCreate).toBe('function')
  })

  it('returns leave function', () => {
    const { result } = renderHook(() => useFamily())
    expect(typeof result.current.leave).toBe('function')
  })
})
