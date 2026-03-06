import { describe, it, expect } from 'vitest'
import { isNextDay } from './timeUtils'

describe('isNextDay', () => {
  it('같은 날이면 false', () => {
    expect(isNextDay('2025-01-15T10:00:00', '2025-01-15T14:00:00')).toBe(false)
  })

  it('다음 날이면 true', () => {
    expect(isNextDay('2025-01-15T23:20:00', '2025-01-16T09:00:00')).toBe(true)
  })

  it('자정 경계 — 23:59 → 00:01 다음날이면 true', () => {
    expect(isNextDay('2025-01-15T23:59:00', '2025-01-16T00:01:00')).toBe(true)
  })

  it('2일 이상 차이도 true', () => {
    expect(isNextDay('2025-01-15T22:00:00', '2025-01-17T08:00:00')).toBe(true)
  })
})
