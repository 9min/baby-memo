export interface Family {
  id: string
  code: string
  password: string
  created_at: string
  updated_at: string
}

export interface Device {
  id: string
  device_id: string
  family_id: string
  nickname: string | null
  created_at: string
  updated_at: string
}

export type ActivityType = 'solid_food' | 'drink' | 'supplement' | 'diaper' | 'sleep'
export type DrinkType = 'formula' | 'milk' | 'water'
export type DiaperType = 'pee' | 'poo'
export type DiaperAmount = 'little' | 'normal' | 'much'

export interface SolidFoodMetadata {
  food_name: string
}

export interface DrinkMetadata {
  drink_type: DrinkType
  amount_ml: number
}

export interface DiaperMetadata {
  diaper_type: DiaperType
  amount: DiaperAmount
}

export interface SupplementMetadata {
  supplement_names: string[]
}

export interface SleepMetadata {
  note: string
  end_time: string | null
}

export type ActivityMetadata = SolidFoodMetadata | DrinkMetadata | DiaperMetadata | SupplementMetadata | SleepMetadata

export interface Activity {
  id: string
  family_id: string
  device_id: string
  type: ActivityType
  recorded_at: string
  memo: string | null
  metadata: ActivityMetadata
  created_at: string
}

export interface SupplementPreset {
  id: string
  family_id: string
  name: string
  created_at: string
}
