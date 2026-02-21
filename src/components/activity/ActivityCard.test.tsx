import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ActivityCard from './ActivityCard'
import { createMockActivity, resetMockActivityCounter } from '@/test/helpers/mockActivity'
import type { SolidFoodMetadata, DrinkMetadata, DiaperMetadata, SupplementMetadata, SleepMetadata, MemoMetadata } from '@/types/database'

// Mock the store
vi.mock('@/stores/activityStore', () => ({
  useActivityStore: vi.fn((selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      deleteActivity: vi.fn(),
    }),
  ),
}))

describe('ActivityCard', () => {
  beforeEach(() => {
    resetMockActivityCounter()
    vi.clearAllMocks()
  })

  it('renders activity type label', () => {
    const activity = createMockActivity({ type: 'solid_food' })
    render(<ActivityCard activity={activity} />)
    expect(screen.getByText('먹어요')).toBeInTheDocument()
  })

  it('renders time in HH:mm format', () => {
    const activity = createMockActivity({
      recorded_at: '2025-01-15T10:30:00',
    })
    render(<ActivityCard activity={activity} />)
    expect(screen.getByText('10:30')).toBeInTheDocument()
  })

  it('displays food name for solid_food type', () => {
    const activity = createMockActivity({
      type: 'solid_food',
      metadata: { food_name: '감자죽' } satisfies SolidFoodMetadata,
    })
    render(<ActivityCard activity={activity} />)
    expect(screen.getByText('감자죽')).toBeInTheDocument()
  })

  it('displays drink details for drink type', () => {
    const activity = createMockActivity({
      type: 'drink',
      metadata: { drink_type: 'formula', amount_ml: 150 } satisfies DrinkMetadata,
    })
    render(<ActivityCard activity={activity} />)
    expect(screen.getByText('분유 · 150ml')).toBeInTheDocument()
  })

  it('displays diaper details', () => {
    const activity = createMockActivity({
      type: 'diaper',
      metadata: { diaper_type: 'pee', amount: 'normal' } satisfies DiaperMetadata,
    })
    render(<ActivityCard activity={activity} />)
    expect(screen.getByText('소변 · 보통')).toBeInTheDocument()
  })

  it('displays supplement names', () => {
    const activity = createMockActivity({
      type: 'supplement',
      metadata: { supplement_names: ['비타민D', '오메가3'] } satisfies SupplementMetadata,
    })
    render(<ActivityCard activity={activity} />)
    expect(screen.getByText('비타민D, 오메가3')).toBeInTheDocument()
  })

  it('displays memo content for memo type', () => {
    const activity = createMockActivity({
      type: 'memo',
      metadata: { content: '컨디션 좋음' } satisfies MemoMetadata,
    })
    render(<ActivityCard activity={activity} />)
    expect(screen.getByText('컨디션 좋음')).toBeInTheDocument()
  })

  it('displays 취침 for sleep with no end_time and no note', () => {
    const activity = createMockActivity({
      type: 'sleep',
      metadata: { note: '', end_time: null } satisfies SleepMetadata,
    })
    render(<ActivityCard activity={activity} />)
    expect(screen.getByText('취침')).toBeInTheDocument()
  })

  it('displays memo when present', () => {
    const activity = createMockActivity({ memo: '잘 먹었음' })
    render(<ActivityCard activity={activity} />)
    expect(screen.getByText('잘 먹었음')).toBeInTheDocument()
  })

  it('shows delete button by default', () => {
    const activity = createMockActivity()
    render(<ActivityCard activity={activity} />)
    expect(screen.getByLabelText('삭제')).toBeInTheDocument()
  })

  it('hides delete button when showDelete is false', () => {
    const activity = createMockActivity()
    render(<ActivityCard activity={activity} showDelete={false} />)
    expect(screen.queryByLabelText('삭제')).not.toBeInTheDocument()
  })

  it('requires two clicks to delete (confirmation pattern)', async () => {
    const user = userEvent.setup()
    const activity = createMockActivity()
    render(<ActivityCard activity={activity} />)

    const deleteBtn = screen.getByLabelText('삭제')
    await user.click(deleteBtn)

    // Should now show confirmation state
    expect(screen.getByLabelText('삭제 확인')).toBeInTheDocument()
  })

  it('calls onEdit when card is clicked', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    const activity = createMockActivity()
    render(<ActivityCard activity={activity} onEdit={onEdit} />)

    // Click the card, not the delete button
    const card = screen.getByText('먹어요').closest('[class*="cursor-pointer"]')
    if (card) await user.click(card)
    expect(onEdit).toHaveBeenCalledWith(activity)
  })

  it('delete button click does not trigger onEdit', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    const activity = createMockActivity()
    render(<ActivityCard activity={activity} onEdit={onEdit} />)

    await user.click(screen.getByLabelText('삭제'))
    expect(onEdit).not.toHaveBeenCalled()
  })

  it('displays deviceNickname when provided', () => {
    const activity = createMockActivity({ recorded_at: '2025-01-15T10:30:00' })
    render(<ActivityCard activity={activity} deviceNickname="귀여운 토끼" />)
    expect(screen.getByText('귀여운 토끼')).toBeInTheDocument()
  })

  it('does not display nickname separator when deviceNickname is not provided', () => {
    const activity = createMockActivity({ recorded_at: '2025-01-15T10:30:00', memo: null })
    render(<ActivityCard activity={activity} />)
    // Should only have time, no separator dots
    expect(screen.getByText('10:30')).toBeInTheDocument()
    expect(screen.queryByText('·')).not.toBeInTheDocument()
  })
})
