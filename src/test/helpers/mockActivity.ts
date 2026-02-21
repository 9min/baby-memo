import type {
  Activity,
  ActivityType,
  ActivityMetadata,
  SolidFoodMetadata,
  DrinkMetadata,
  DiaperMetadata,
  SupplementMetadata,
  SleepMetadata,
  MemoMetadata,
} from '@/types/database'

let counter = 0

function nextId(): string {
  counter++
  return `activity-${counter}`
}

const defaultMetadata: Record<ActivityType, ActivityMetadata> = {
  solid_food: { food_name: '감자죽' } satisfies SolidFoodMetadata,
  drink: { drink_type: 'formula', amount_ml: 100 } satisfies DrinkMetadata,
  diaper: { diaper_type: 'pee', amount: 'normal' } satisfies DiaperMetadata,
  supplement: { supplement_names: ['비타민D'] } satisfies SupplementMetadata,
  sleep: { note: '', end_time: null } satisfies SleepMetadata,
  memo: { content: '메모 내용' } satisfies MemoMetadata,
}

export function createMockActivity(
  overrides: Partial<Activity> & { type?: ActivityType } = {},
): Activity {
  const type = overrides.type ?? 'solid_food'
  return {
    id: nextId(),
    family_id: 'family-1',
    device_id: 'device-1',
    type,
    recorded_at: new Date('2025-01-15T10:00:00').toISOString(),
    memo: null,
    metadata: defaultMetadata[type],
    created_at: new Date('2025-01-15T10:00:00').toISOString(),
    ...overrides,
  }
}

export function resetMockActivityCounter() {
  counter = 0
}
