import { UtensilsCrossed, GlassWater, Pill, Moon, StickyNote, createLucideIcon } from 'lucide-react'
import { diaper } from '@lucide/lab'
import type { ActivityType, DrinkType, DiaperType, DiaperAmount } from '@/types/database'
import type { LucideIcon } from 'lucide-react'

const DiaperIcon = createLucideIcon('Diaper', diaper)

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
    icon: DiaperIcon,
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    textColor: 'text-emerald-600 dark:text-emerald-400',
  },
  sleep: {
    type: 'sleep',
    label: '잠자요',
    icon: Moon,
    bgColor: 'bg-slate-100 dark:bg-slate-900/40',
    textColor: 'text-slate-600 dark:text-slate-400',
  },
  memo: {
    type: 'memo',
    label: '메모',
    icon: StickyNote,
    bgColor: 'bg-rose-50 dark:bg-rose-950/40',
    textColor: 'text-rose-600 dark:text-rose-400',
  },
}

export const ACTIVITY_TYPES: ActivityType[] = ['solid_food', 'drink', 'supplement', 'sleep', 'diaper', 'memo']

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
