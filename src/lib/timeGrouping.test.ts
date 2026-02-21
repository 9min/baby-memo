import { describe, it, expect } from 'vitest'
import { groupByTimeOfDay } from './timeGrouping'
import { createMockActivity, resetMockActivityCounter } from '@/test/helpers/mockActivity'
import { beforeEach } from 'vitest'

describe('groupByTimeOfDay', () => {
  beforeEach(() => {
    resetMockActivityCounter()
  })

  it('returns empty array for no activities', () => {
    expect(groupByTimeOfDay([])).toEqual([])
  })

  it('groups morning activities (6-12)', () => {
    const activities = [
      createMockActivity({ recorded_at: '2025-01-15T06:00:00' }),
      createMockActivity({ recorded_at: '2025-01-15T11:59:00' }),
    ]
    const groups = groupByTimeOfDay(activities)
    expect(groups).toHaveLength(1)
    expect(groups[0].label).toBe('오전')
    expect(groups[0].activities).toHaveLength(2)
  })

  it('groups afternoon activities (12-18)', () => {
    const activities = [
      createMockActivity({ recorded_at: '2025-01-15T12:00:00' }),
      createMockActivity({ recorded_at: '2025-01-15T17:59:00' }),
    ]
    const groups = groupByTimeOfDay(activities)
    expect(groups).toHaveLength(1)
    expect(groups[0].label).toBe('오후')
    expect(groups[0].activities).toHaveLength(2)
  })

  it('groups evening/night activities (18-24, 0-6)', () => {
    const activities = [
      createMockActivity({ recorded_at: '2025-01-15T18:00:00' }),
      createMockActivity({ recorded_at: '2025-01-15T23:59:00' }),
      createMockActivity({ recorded_at: '2025-01-15T02:00:00' }),
    ]
    const groups = groupByTimeOfDay(activities)
    expect(groups).toHaveLength(1)
    expect(groups[0].label).toBe('저녁/밤')
    expect(groups[0].activities).toHaveLength(3)
  })

  it('groups activities into multiple time periods', () => {
    const activities = [
      createMockActivity({ recorded_at: '2025-01-15T08:00:00' }),
      createMockActivity({ recorded_at: '2025-01-15T14:00:00' }),
      createMockActivity({ recorded_at: '2025-01-15T22:00:00' }),
    ]
    const groups = groupByTimeOfDay(activities)
    expect(groups).toHaveLength(3)
    expect(groups[0].label).toBe('오전')
    expect(groups[1].label).toBe('오후')
    expect(groups[2].label).toBe('저녁/밤')
  })

  it('only includes groups with activities', () => {
    const activities = [
      createMockActivity({ recorded_at: '2025-01-15T08:00:00' }),
      createMockActivity({ recorded_at: '2025-01-15T22:00:00' }),
    ]
    const groups = groupByTimeOfDay(activities)
    expect(groups).toHaveLength(2)
    expect(groups[0].label).toBe('오전')
    expect(groups[1].label).toBe('저녁/밤')
  })

  it('handles midnight correctly as evening/night', () => {
    const activities = [
      createMockActivity({ recorded_at: '2025-01-15T00:00:00' }),
    ]
    const groups = groupByTimeOfDay(activities)
    expect(groups).toHaveLength(1)
    expect(groups[0].label).toBe('저녁/밤')
  })

  it('hour 5 is evening/night, hour 6 is morning', () => {
    const activities = [
      createMockActivity({ recorded_at: '2025-01-15T05:59:00' }),
      createMockActivity({ recorded_at: '2025-01-15T06:00:00' }),
    ]
    const groups = groupByTimeOfDay(activities)
    expect(groups).toHaveLength(2)
    expect(groups[0].label).toBe('오전')
    expect(groups[0].activities).toHaveLength(1)
    expect(groups[1].label).toBe('저녁/밤')
    expect(groups[1].activities).toHaveLength(1)
  })
})
