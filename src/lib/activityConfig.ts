import { UtensilsCrossed, GlassWater, Droplets } from 'lucide-react'
import type { ActivityType, DrinkType, DiaperType, DiaperAmount } from '@/types/database'
import type { LucideIcon } from 'lucide-react'

export interface ActivityConfig {
  type: ActivityType
  label: string
  icon: LucideIcon
  bgColor: string
  textColor: string
}

export const ACTIVITY_CONFIGS: Record<ActivityType, ActivityConfig> = {
  solid_food: {
    type: 'solid_food',
    label: '먹어요',
    icon: UtensilsCrossed,
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
  },
  drink: {
    type: 'drink',
    label: '마셔요',
    icon: GlassWater,
    bgColor: 'bg-sky-100',
    textColor: 'text-sky-700',
  },
  diaper: {
    type: 'diaper',
    label: '기저귀',
    icon: Droplets,
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
  },
}

export const ACTIVITY_TYPES: ActivityType[] = ['solid_food', 'drink', 'diaper']

export const DRINK_TYPE_LABELS: Record<DrinkType, string> = {
  milk: '우유',
  water: '물',
}

export const DIAPER_TYPE_LABELS: Record<DiaperType, string> = {
  pee: '소변',
  poo: '대변',
}

export const DIAPER_AMOUNT_LABELS: Record<DiaperAmount, string> = {
  little: '조금',
  normal: '보통',
  much: '많이',
}
