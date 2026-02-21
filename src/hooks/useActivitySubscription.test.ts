import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useActivitySubscription } from './useActivitySubscription'
import { useFamilyStore } from '@/stores/familyStore'
import { useActivityStore } from '@/stores/activityStore'
import { resetAllStores } from '@/test/helpers/zustandTestUtils'

describe('useActivitySubscription', () => {
  beforeEach(() => {
    resetAllStores()
    vi.clearAllMocks()
  })

  it('does not subscribe when no familyId', () => {
    useFamilyStore.setState({ familyId: null })
    const subscribeSpy = vi.fn()
    useActivityStore.setState({ subscribe: subscribeSpy })

    renderHook(() => useActivitySubscription())
    expect(subscribeSpy).not.toHaveBeenCalled()
  })

  it('subscribes when familyId is present', () => {
    useFamilyStore.setState({ familyId: 'fam-1' })
    const subscribeSpy = vi.fn()
    const unsubscribeSpy = vi.fn()
    useActivityStore.setState({
      subscribe: subscribeSpy,
      unsubscribe: unsubscribeSpy,
    })

    renderHook(() => useActivitySubscription())
    expect(subscribeSpy).toHaveBeenCalledWith('fam-1')
  })

  it('fetches activities when familyId is present', () => {
    useFamilyStore.setState({ familyId: 'fam-1' })
    const fetchSpy = vi.fn()
    useActivityStore.setState({
      fetchActivities: fetchSpy,
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    })

    renderHook(() => useActivitySubscription())
    expect(fetchSpy).toHaveBeenCalled()
  })

  it('does not fetch when no familyId', () => {
    useFamilyStore.setState({ familyId: null })
    const fetchSpy = vi.fn()
    useActivityStore.setState({ fetchActivities: fetchSpy })

    renderHook(() => useActivitySubscription())
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('unsubscribes on unmount', () => {
    useFamilyStore.setState({ familyId: 'fam-1' })
    const unsubscribeSpy = vi.fn()
    useActivityStore.setState({
      subscribe: vi.fn(),
      unsubscribe: unsubscribeSpy,
    })

    const { unmount } = renderHook(() => useActivitySubscription())
    unmount()
    expect(unsubscribeSpy).toHaveBeenCalled()
  })

  it('subscribes to devices when familyId is present', () => {
    const subscribeDevicesSpy = vi.fn()
    useFamilyStore.setState({
      familyId: 'fam-1',
      subscribeDevices: subscribeDevicesSpy,
      unsubscribeDevices: vi.fn(),
    })

    renderHook(() => useActivitySubscription())
    expect(subscribeDevicesSpy).toHaveBeenCalledWith('fam-1')
  })

  it('does not subscribe to devices when no familyId', () => {
    const subscribeDevicesSpy = vi.fn()
    useFamilyStore.setState({
      familyId: null,
      subscribeDevices: subscribeDevicesSpy,
      unsubscribeDevices: vi.fn(),
    })

    renderHook(() => useActivitySubscription())
    expect(subscribeDevicesSpy).not.toHaveBeenCalled()
  })

  it('unsubscribes devices on unmount', () => {
    const unsubscribeDevicesSpy = vi.fn()
    useFamilyStore.setState({
      familyId: 'fam-1',
      subscribeDevices: vi.fn(),
      unsubscribeDevices: unsubscribeDevicesSpy,
    })

    const { unmount } = renderHook(() => useActivitySubscription())
    unmount()
    expect(unsubscribeDevicesSpy).toHaveBeenCalled()
  })
})
