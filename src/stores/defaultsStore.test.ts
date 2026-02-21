import { describe, it, expect, beforeEach } from 'vitest'
import { useDefaultsStore } from './defaultsStore'

describe('defaultsStore', () => {
  beforeEach(() => {
    useDefaultsStore.setState({ defaultsByFamily: {} })
  })

  describe('getDefaults', () => {
    it('returns initial defaults for unknown family', () => {
      const defaults = useDefaultsStore.getState().getDefaults('UNKNOWN')
      expect(defaults.solidFood.food_name).toBe('')
      expect(defaults.drink.drink_type).toBeNull()
      expect(defaults.drink.amount_ml).toBe('')
      expect(defaults.supplement.supplement_names).toEqual([])
      expect(defaults.diaper.diaper_type).toBeNull()
      expect(defaults.diaper.amount).toBeNull()
    })

    it('returns saved defaults for known family', () => {
      useDefaultsStore.getState().setSolidFoodDefaults('FAM001', '감자죽')
      const defaults = useDefaultsStore.getState().getDefaults('FAM001')
      expect(defaults.solidFood.food_name).toBe('감자죽')
    })
  })

  describe('setSolidFoodDefaults', () => {
    it('saves solid food default', () => {
      useDefaultsStore.getState().setSolidFoodDefaults('FAM001', '바나나')
      const defaults = useDefaultsStore.getState().getDefaults('FAM001')
      expect(defaults.solidFood.food_name).toBe('바나나')
    })

    it('preserves other defaults when setting solid food', () => {
      useDefaultsStore.getState().setDrinkDefaults('FAM001', 'formula', '100')
      useDefaultsStore.getState().setSolidFoodDefaults('FAM001', '죽')
      const defaults = useDefaultsStore.getState().getDefaults('FAM001')
      expect(defaults.drink.drink_type).toBe('formula')
      expect(defaults.solidFood.food_name).toBe('죽')
    })
  })

  describe('setDrinkDefaults', () => {
    it('saves drink defaults', () => {
      useDefaultsStore.getState().setDrinkDefaults('FAM001', 'milk', '200')
      const defaults = useDefaultsStore.getState().getDefaults('FAM001')
      expect(defaults.drink.drink_type).toBe('milk')
      expect(defaults.drink.amount_ml).toBe('200')
    })

    it('allows null drink type', () => {
      useDefaultsStore.getState().setDrinkDefaults('FAM001', null, '')
      const defaults = useDefaultsStore.getState().getDefaults('FAM001')
      expect(defaults.drink.drink_type).toBeNull()
    })
  })

  describe('setSupplementDefaults', () => {
    it('saves supplement defaults', () => {
      useDefaultsStore.getState().setSupplementDefaults('FAM001', ['비타민D', '오메가3'])
      const defaults = useDefaultsStore.getState().getDefaults('FAM001')
      expect(defaults.supplement.supplement_names).toEqual(['비타민D', '오메가3'])
    })

    it('allows empty array', () => {
      useDefaultsStore.getState().setSupplementDefaults('FAM001', [])
      const defaults = useDefaultsStore.getState().getDefaults('FAM001')
      expect(defaults.supplement.supplement_names).toEqual([])
    })
  })

  describe('setDiaperDefaults', () => {
    it('saves diaper defaults', () => {
      useDefaultsStore.getState().setDiaperDefaults('FAM001', 'pee', 'normal')
      const defaults = useDefaultsStore.getState().getDefaults('FAM001')
      expect(defaults.diaper.diaper_type).toBe('pee')
      expect(defaults.diaper.amount).toBe('normal')
    })

    it('allows null values', () => {
      useDefaultsStore.getState().setDiaperDefaults('FAM001', null, null)
      const defaults = useDefaultsStore.getState().getDefaults('FAM001')
      expect(defaults.diaper.diaper_type).toBeNull()
      expect(defaults.diaper.amount).toBeNull()
    })
  })

  describe('clearDefaults', () => {
    it('removes all defaults for a family', () => {
      useDefaultsStore.getState().setSolidFoodDefaults('FAM001', '죽')
      useDefaultsStore.getState().setDrinkDefaults('FAM001', 'water', '50')
      useDefaultsStore.getState().clearDefaults('FAM001')
      const defaults = useDefaultsStore.getState().getDefaults('FAM001')
      expect(defaults.solidFood.food_name).toBe('')
      expect(defaults.drink.drink_type).toBeNull()
    })

    it('does not affect other families', () => {
      useDefaultsStore.getState().setSolidFoodDefaults('FAM001', '죽')
      useDefaultsStore.getState().setSolidFoodDefaults('FAM002', '밥')
      useDefaultsStore.getState().clearDefaults('FAM001')
      expect(useDefaultsStore.getState().getDefaults('FAM002').solidFood.food_name).toBe('밥')
    })
  })

  describe('multi-family isolation', () => {
    it('maintains separate defaults per family', () => {
      useDefaultsStore.getState().setSolidFoodDefaults('FAM001', '죽')
      useDefaultsStore.getState().setSolidFoodDefaults('FAM002', '밥')
      expect(useDefaultsStore.getState().getDefaults('FAM001').solidFood.food_name).toBe('죽')
      expect(useDefaultsStore.getState().getDefaults('FAM002').solidFood.food_name).toBe('밥')
    })
  })
})
