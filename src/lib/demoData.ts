import type { Activity, Baby, SupplementPreset } from '@/types/database'

export const DEMO_FAMILY_ID = 'demo-family-00000000'
export const DEMO_FAMILY_CODE = 'DEMO01'
export const DEMO_DEVICE_ID = 'demo-device-00000000'

const FOOD_NAMES = [
  '감자죽', '당근죽', '소고기죽', '브로콜리죽', '닭고기죽',
  '고구마죽', '시금치죽', '애호박죽', '오트밀죽', '바나나죽',
]

const MEMO_TEXTS = [
  '오늘 잘 먹었어요',
  '컨디션이 좋아 보여요',
  '새로운 음식 시도했어요',
  '낮잠을 잘 잤어요',
  '기분이 좋아서 많이 웃었어요',
]

function deterministicHash(dayIndex: number, slot: number): number {
  return (dayIndex * 7 + slot * 13 + 37) % 100
}

function generateId(dayIndex: number, slot: number): string {
  const pad = (n: number) => String(n).padStart(4, '0')
  return `demo-${pad(dayIndex)}-${pad(slot)}`
}

function makeActivity(
  id: string,
  type: Activity['type'],
  recordedAt: Date,
  metadata: Activity['metadata'],
  memo?: string,
): Activity {
  return {
    id,
    family_id: DEMO_FAMILY_ID,
    device_id: DEMO_DEVICE_ID,
    type,
    recorded_at: recordedAt.toISOString(),
    memo: memo ?? null,
    metadata,
    created_at: recordedAt.toISOString(),
  }
}

function addMinuteVariation(base: Date, hours: number, minutes: number, dayIndex: number, slot: number): Date {
  const d = new Date(base)
  const variation = (deterministicHash(dayIndex, slot) % 31) - 15 // -15 ~ +15 minutes
  d.setHours(hours, minutes + variation, 0, 0)
  return d
}

export function generateDemoBaby(): Baby {
  const birthdate = new Date()
  birthdate.setMonth(birthdate.getMonth() - 8)
  return {
    id: 'demo-baby-00000000',
    family_id: DEMO_FAMILY_ID,
    name: '아기',
    birthdate: birthdate.toISOString().slice(0, 10),
    created_at: birthdate.toISOString(),
  }
}

export function generateDemoSupplementPresets(): SupplementPreset[] {
  return [
    {
      id: 'demo-preset-0001',
      family_id: DEMO_FAMILY_ID,
      name: '비타민D',
      sort_order: 0,
      created_at: new Date().toISOString(),
    },
    {
      id: 'demo-preset-0002',
      family_id: DEMO_FAMILY_ID,
      name: '유산균',
      sort_order: 1,
      created_at: new Date().toISOString(),
    },
  ]
}

export function generateDemoActivities(): Activity[] {
  const activities: Activity[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const dayBase = new Date(today)
    dayBase.setDate(dayBase.getDate() - dayOffset)
    const dayIndex = 29 - dayOffset
    let slot = 0

    // --- solid_food: 2~3 meals ---
    const mealCount = deterministicHash(dayIndex, 0) % 2 === 0 ? 3 : 2
    const mealTimes = [[8, 0], [12, 0], [17, 30]]
    for (let i = 0; i < mealCount; i++) {
      const [h, m] = mealTimes[i]
      const t = addMinuteVariation(dayBase, h, m, dayIndex, slot)
      const foodName = FOOD_NAMES[(dayIndex * 3 + i) % FOOD_NAMES.length]
      activities.push(makeActivity(
        generateId(dayIndex, slot++),
        'solid_food',
        t,
        { food_name: foodName },
      ))
    }

    // --- drink: 4~5 times ---
    const drinkCount = deterministicHash(dayIndex, 1) % 2 === 0 ? 5 : 4
    const drinkTimes = [[7, 0], [10, 30], [13, 30], [16, 0], [19, 0]]
    for (let i = 0; i < drinkCount; i++) {
      const [h, m] = drinkTimes[i]
      const t = addMinuteVariation(dayBase, h, m, dayIndex, slot)
      const isWater = i >= 3
      const drinkType = isWater ? 'water' as const : 'formula' as const
      const amountMl = isWater
        ? 30 + (deterministicHash(dayIndex, slot) % 4) * 10 // 30-60ml
        : 80 + (deterministicHash(dayIndex, slot) % 5) * 10 // 80-120ml
      activities.push(makeActivity(
        generateId(dayIndex, slot++),
        'drink',
        t,
        { drink_type: drinkType, amount_ml: amountMl },
      ))
    }

    // --- sleep: 3 sessions (2 naps + 1 night) ---
    // Nap 1: ~09:30-10:30
    {
      const napStart = addMinuteVariation(dayBase, 9, 30, dayIndex, slot)
      const durationMin = 45 + (deterministicHash(dayIndex, slot) % 31) // 45-75 min
      const napEnd = new Date(napStart.getTime() + durationMin * 60000)
      activities.push(makeActivity(
        generateId(dayIndex, slot++),
        'sleep',
        napStart,
        { note: '', end_time: napEnd.toISOString() },
      ))
    }

    // Nap 2: ~13:00-14:30
    {
      const napStart = addMinuteVariation(dayBase, 13, 0, dayIndex, slot)
      const durationMin = 60 + (deterministicHash(dayIndex, slot) % 31) // 60-90 min
      const napEnd = new Date(napStart.getTime() + durationMin * 60000)
      activities.push(makeActivity(
        generateId(dayIndex, slot++),
        'sleep',
        napStart,
        { note: '', end_time: napEnd.toISOString() },
      ))
    }

    // Night sleep: ~20:00 - next day 06:30
    {
      const nightStart = addMinuteVariation(dayBase, 20, 0, dayIndex, slot)
      const durationMin = 600 + (deterministicHash(dayIndex, slot) % 31) // 600-630 min (10-10.5h)
      const nightEnd = new Date(nightStart.getTime() + durationMin * 60000)
      activities.push(makeActivity(
        generateId(dayIndex, slot++),
        'sleep',
        nightStart,
        { note: '', end_time: nightEnd.toISOString() },
      ))
    }

    // --- diaper: 5~6 changes ---
    const diaperCount = deterministicHash(dayIndex, 2) % 2 === 0 ? 6 : 5
    const diaperTimes = [[7, 30], [9, 0], [11, 30], [14, 30], [17, 0], [19, 30]]
    for (let i = 0; i < diaperCount; i++) {
      const [h, m] = diaperTimes[i]
      const t = addMinuteVariation(dayBase, h, m, dayIndex, slot)
      const isPoo = i === 1 || (i === 4 && deterministicHash(dayIndex, slot) % 3 === 0)
      const amounts = ['little', 'normal', 'much'] as const
      const amount = amounts[deterministicHash(dayIndex, slot) % 3]
      activities.push(makeActivity(
        generateId(dayIndex, slot++),
        'diaper',
        t,
        { diaper_type: isPoo ? 'poo' : 'pee', amount },
      ))
    }

    // --- supplement: 1 time ---
    {
      const t = addMinuteVariation(dayBase, 9, 0, dayIndex, slot)
      activities.push(makeActivity(
        generateId(dayIndex, slot++),
        'supplement',
        t,
        { supplement_names: ['비타민D', '유산균'] },
      ))
    }

    // --- memo: every 3-5 days ---
    if (dayIndex % 4 === 0) {
      const t = addMinuteVariation(dayBase, 15, 0, dayIndex, slot)
      const content = MEMO_TEXTS[dayIndex % MEMO_TEXTS.length]
      activities.push(makeActivity(
        generateId(dayIndex, slot++),
        'memo',
        t,
        { content },
      ))
    }
  }

  // Sort by recorded_at ascending
  activities.sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
  return activities
}
