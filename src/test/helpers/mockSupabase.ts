import { vi } from 'vitest'
import { supabase } from '@/lib/supabase'

type MockedSupabase = typeof supabase & {
  from: ReturnType<typeof vi.fn>
}

interface MockQueryResult {
  data?: unknown
  error?: { message: string } | null
  count?: number | null
}

export function mockSupabaseQuery(result: MockQueryResult = {}) {
  const { data = null, error = null, count = null } = result

  const builder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error }),
  }

  // Make terminal methods resolve correctly
  // For non-single queries, mock the builder itself to resolve
  const resolveValue = { data, error, count }
  builder.order.mockResolvedValue(resolveValue)
  builder.eq.mockImplementation(function (this: typeof builder) {
    return Object.assign({}, this, {
      eq: this.eq,
      single: this.single,
      order: this.order,
      select: this.select,
    })
  })

  const mockedSupabase = supabase as MockedSupabase
  mockedSupabase.from.mockReturnValue(builder)

  return builder
}

export function mockSupabaseChain(steps: MockQueryResult[]) {
  const mockedSupabase = supabase as MockedSupabase
  let callIndex = 0

  mockedSupabase.from.mockImplementation(() => {
    const result = steps[callIndex] ?? steps[steps.length - 1]
    callIndex++
    return createBuilder(result)
  })
}

function createBuilder(result: MockQueryResult) {
  const { data = null, error = null, count = null } = result

  const builder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data, error, count }),
    single: vi.fn().mockResolvedValue({ data, error }),
  }

  return builder
}
