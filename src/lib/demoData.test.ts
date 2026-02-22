import { describe, it, expect, vi } from 'vitest'
import {
  generateDemoActivities,
  generateDemoBaby,
  generateDemoSupplementPresets,
  DEMO_FAMILY_ID,
} from '@/lib/demoData'

describe('demoData', () => {
  describe('generateDemoActivities', () => {
    const activities = generateDemoActivities()

    it('30일 범위의 활동을 생성한다', () => {
      expect(activities.length).toBeGreaterThan(0)

      const dates = new Set(
        activities.map((a) => a.recorded_at.slice(0, 10)),
      )
      // 30 days of activities, but night sleep end_time may extend to day 31
      expect(dates.size).toBeGreaterThanOrEqual(30)
      expect(dates.size).toBeLessThanOrEqual(31)
    })

    it('모든 활동 유형이 포함된다', () => {
      const types = new Set(activities.map((a) => a.type))
      expect(types).toContain('solid_food')
      expect(types).toContain('drink')
      expect(types).toContain('sleep')
      expect(types).toContain('diaper')
      expect(types).toContain('supplement')
      expect(types).toContain('memo')
    })

    it('모든 활동의 family_id가 DEMO_FAMILY_ID이다', () => {
      for (const a of activities) {
        expect(a.family_id).toBe(DEMO_FAMILY_ID)
      }
    })

    it('recorded_at 기준 오름차순 정렬되어 있다', () => {
      for (let i = 1; i < activities.length; i++) {
        expect(
          new Date(activities[i].recorded_at).getTime(),
        ).toBeGreaterThanOrEqual(
          new Date(activities[i - 1].recorded_at).getTime(),
        )
      }
    })

    it('drink 메타데이터에 drink_type과 amount_ml이 있다', () => {
      const drinks = activities.filter((a) => a.type === 'drink')
      expect(drinks.length).toBeGreaterThan(0)
      for (const d of drinks) {
        const meta = d.metadata as { drink_type: string; amount_ml: number }
        expect(['formula', 'milk', 'water']).toContain(meta.drink_type)
        expect(meta.amount_ml).toBeGreaterThan(0)
      }
    })

    it('sleep 메타데이터에 end_time이 있다', () => {
      const sleeps = activities.filter((a) => a.type === 'sleep')
      expect(sleeps.length).toBeGreaterThan(0)
      for (const s of sleeps) {
        const meta = s.metadata as { end_time: string | null }
        expect(meta.end_time).toBeTruthy()
      }
    })

    it('결정적 생성: 두 번 호출해도 같은 결과', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-06-15T12:00:00'))
      const first = generateDemoActivities()
      const second = generateDemoActivities()
      expect(first.length).toBe(second.length)
      for (let i = 0; i < first.length; i++) {
        expect(first[i].id).toBe(second[i].id)
        expect(first[i].recorded_at).toBe(second[i].recorded_at)
      }
      vi.useRealTimers()
    })
  })

  describe('generateDemoBaby', () => {
    it('8개월 전 생년월일의 아기를 생성한다', () => {
      const baby = generateDemoBaby()
      expect(baby.name).toBe('아기')
      expect(baby.family_id).toBe(DEMO_FAMILY_ID)
      const birthdate = new Date(baby.birthdate)
      const now = new Date()
      const monthsDiff = (now.getFullYear() - birthdate.getFullYear()) * 12 +
        (now.getMonth() - birthdate.getMonth())
      expect(monthsDiff).toBe(8)
    })
  })

  describe('generateDemoSupplementPresets', () => {
    it('비타민D와 유산균 프리셋을 생성한다', () => {
      const presets = generateDemoSupplementPresets()
      expect(presets).toHaveLength(2)
      expect(presets[0].name).toBe('비타민D')
      expect(presets[1].name).toBe('유산균')
      expect(presets[0].family_id).toBe(DEMO_FAMILY_ID)
    })
  })
})
