import { describe, it, expect } from 'vitest'
import {
  ACTIVITY_CONFIGS,
  ACTIVITY_TYPES,
  DRINK_TYPE_LABELS,
  DIAPER_TYPE_LABELS,
  DIAPER_AMOUNT_LABELS,
} from './activityConfig'

describe('ACTIVITY_CONFIGS', () => {
  it('has config for every activity type', () => {
    const types = ['solid_food', 'drink', 'supplement', 'diaper', 'sleep'] as const
    for (const type of types) {
      expect(ACTIVITY_CONFIGS[type]).toBeDefined()
    }
  })

  it('each config has required fields', () => {
    for (const config of Object.values(ACTIVITY_CONFIGS)) {
      expect(config.type).toBeDefined()
      expect(config.label).toBeTruthy()
      expect(config.icon).toBeDefined()
      expect(config.bgColor).toBeTruthy()
      expect(config.textColor).toBeTruthy()
    }
  })

  it('config type matches its key', () => {
    for (const [key, config] of Object.entries(ACTIVITY_CONFIGS)) {
      expect(config.type).toBe(key)
    }
  })

  it('solid_food config has correct Korean label', () => {
    expect(ACTIVITY_CONFIGS.solid_food.label).toBe('먹어요')
  })

  it('drink config has correct Korean label', () => {
    expect(ACTIVITY_CONFIGS.drink.label).toBe('마셔요')
  })

  it('supplement config has correct Korean label', () => {
    expect(ACTIVITY_CONFIGS.supplement.label).toBe('영양제')
  })

  it('diaper config has correct Korean label', () => {
    expect(ACTIVITY_CONFIGS.diaper.label).toBe('기저귀')
  })

  it('sleep config has correct Korean label', () => {
    expect(ACTIVITY_CONFIGS.sleep.label).toBe('잠자요')
  })
})

describe('ACTIVITY_TYPES', () => {
  it('contains all 5 activity types', () => {
    expect(ACTIVITY_TYPES).toHaveLength(5)
  })

  it('contains solid_food, drink, supplement, sleep, diaper', () => {
    expect(ACTIVITY_TYPES).toContain('solid_food')
    expect(ACTIVITY_TYPES).toContain('drink')
    expect(ACTIVITY_TYPES).toContain('supplement')
    expect(ACTIVITY_TYPES).toContain('sleep')
    expect(ACTIVITY_TYPES).toContain('diaper')
  })
})

describe('DRINK_TYPE_LABELS', () => {
  it('has Korean labels for all drink types', () => {
    expect(DRINK_TYPE_LABELS.formula).toBe('분유')
    expect(DRINK_TYPE_LABELS.milk).toBe('우유')
    expect(DRINK_TYPE_LABELS.water).toBe('물')
  })
})

describe('DIAPER_TYPE_LABELS', () => {
  it('has Korean labels for all diaper types', () => {
    expect(DIAPER_TYPE_LABELS.pee).toBe('소변')
    expect(DIAPER_TYPE_LABELS.poo).toBe('대변')
  })
})

describe('DIAPER_AMOUNT_LABELS', () => {
  it('has Korean labels for all diaper amounts', () => {
    expect(DIAPER_AMOUNT_LABELS.little).toBe('조금')
    expect(DIAPER_AMOUNT_LABELS.normal).toBe('보통')
    expect(DIAPER_AMOUNT_LABELS.much).toBe('많이')
  })
})
