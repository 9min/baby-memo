import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DrinkType, DiaperType, DiaperAmount } from '@/types/database'

interface ActivityDefaults {
  solidFood: {
    food_name: string
  }
  drink: {
    drink_type: DrinkType | null
    amount_ml: string
  }
  supplement: {
    supplement_names: string[]
  }
  diaper: {
    diaper_type: DiaperType | null
    amount: DiaperAmount | null
  }
}

interface DefaultsState {
  defaultsByFamily: Record<string, ActivityDefaults>
  getDefaults: (familyCode: string) => ActivityDefaults
  setSolidFoodDefaults: (familyCode: string, food_name: string) => void
  setDrinkDefaults: (familyCode: string, drink_type: DrinkType | null, amount_ml: string) => void
  setSupplementDefaults: (familyCode: string, supplement_names: string[]) => void
  setDiaperDefaults: (familyCode: string, diaper_type: DiaperType | null, amount: DiaperAmount | null) => void
  clearDefaults: (familyCode: string) => void
}

const INITIAL_DEFAULTS: ActivityDefaults = {
  solidFood: { food_name: '' },
  drink: { drink_type: null, amount_ml: '' },
  supplement: { supplement_names: [] },
  diaper: { diaper_type: null, amount: null },
}

export const useDefaultsStore = create<DefaultsState>()(
  persist(
    (set, get) => ({
      defaultsByFamily: {},

      getDefaults: (familyCode) => {
        return get().defaultsByFamily[familyCode] ?? INITIAL_DEFAULTS
      },

      setSolidFoodDefaults: (familyCode, food_name) =>
        set((state) => {
          const current = state.defaultsByFamily[familyCode] ?? INITIAL_DEFAULTS
          return {
            defaultsByFamily: {
              ...state.defaultsByFamily,
              [familyCode]: { ...current, solidFood: { food_name } },
            },
          }
        }),

      setDrinkDefaults: (familyCode, drink_type, amount_ml) =>
        set((state) => {
          const current = state.defaultsByFamily[familyCode] ?? INITIAL_DEFAULTS
          return {
            defaultsByFamily: {
              ...state.defaultsByFamily,
              [familyCode]: { ...current, drink: { drink_type, amount_ml } },
            },
          }
        }),

      setSupplementDefaults: (familyCode, supplement_names) =>
        set((state) => {
          const current = state.defaultsByFamily[familyCode] ?? INITIAL_DEFAULTS
          return {
            defaultsByFamily: {
              ...state.defaultsByFamily,
              [familyCode]: { ...current, supplement: { supplement_names } },
            },
          }
        }),

      setDiaperDefaults: (familyCode, diaper_type, amount) =>
        set((state) => {
          const current = state.defaultsByFamily[familyCode] ?? INITIAL_DEFAULTS
          return {
            defaultsByFamily: {
              ...state.defaultsByFamily,
              [familyCode]: { ...current, diaper: { diaper_type, amount } },
            },
          }
        }),

      clearDefaults: (familyCode) =>
        set((state) => {
          const { [familyCode]: _, ...rest } = state.defaultsByFamily
          void _
          return { defaultsByFamily: rest }
        }),
    }),
    { name: 'baby-memo-defaults' },
  ),
)
