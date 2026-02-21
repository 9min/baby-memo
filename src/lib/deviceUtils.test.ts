import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getDeviceId } from './deviceUtils'

describe('getDeviceId', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('generates a new UUID when none exists in localStorage', () => {
    const id = getDeviceId()
    expect(id).toBe('test-device-uuid-1234')
  })

  it('stores the generated UUID in localStorage', () => {
    getDeviceId()
    expect(localStorage.getItem('baby-memo-device-id')).toBe('test-device-uuid-1234')
  })

  it('returns existing UUID from localStorage', () => {
    localStorage.setItem('baby-memo-device-id', 'existing-uuid')
    const id = getDeviceId()
    expect(id).toBe('existing-uuid')
  })

  it('does not generate new UUID when one exists', () => {
    localStorage.setItem('baby-memo-device-id', 'existing-uuid')
    const randomUUID = vi.mocked(crypto.randomUUID)
    const callsBefore = randomUUID.mock.calls.length
    getDeviceId()
    expect(randomUUID.mock.calls.length).toBe(callsBefore)
  })
})
