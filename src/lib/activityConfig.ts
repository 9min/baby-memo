import { UtensilsCrossed, GlassWater, Pill, Droplets, Moon } from 'lucide-react'
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
    bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    textColor: 'text-amber-600 dark:text-amber-400',
  },
  drink: {
    type: 'drink',
    label: '마셔요',
    icon: GlassWater,
    bgColor: 'bg-sky-50 dark:bg-sky-950/40',
    textColor: 'text-sky-600 dark:text-sky-400',
  },
  supplement: {
    type: 'supplement',
    label: '영양제',
    icon: Pill,
    bgColor: 'bg-violet-50 dark:bg-violet-950/40',
    textColor: 'text-violet-600 dark:text-violet-400',
  },
  diaper: {
    type: 'diaper',
    label: '기저귀',
    icon: Droplets,
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    textColor: 'text-emerald-600 dark:text-emerald-400',
  },
  sleep: {
    type: 'sleep',
    label: '잠자요',
    icon: Moon,
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
    textColor: 'text-indigo-600 dark:text-indigo-400',
  },
}

export const ACTIVITY_TYPES: ActivityType[] = ['solid_food', 'drink', 'supplement', 'sleep', 'diaper']

export const DRINK_TYPE_LABELS: Record<DrinkType, string> = {
  formula: '분유',
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
