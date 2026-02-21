import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DrinkSheet from './DrinkSheet'
import { useFamilyStore } from '@/stores/familyStore'
import { useDefaultsStore } from '@/stores/defaultsStore'

describe('DrinkSheet', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-15T10:30:00'))
    useFamilyStore.setState({ familyCode: 'TESTFAM' })
    useDefaultsStore.setState({ defaultsByFamily: {} })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders title for new record', () => {
    render(
      <DrinkSheet open={true} onOpenChange={() => {}} onSubmit={() => {}} />,
    )
    expect(screen.getByText('마셔요 기록')).toBeInTheDocument()
  })

  it('renders title for editing', () => {
    render(
      <DrinkSheet
        open={true}
        onOpenChange={() => {}}
        onSubmit={() => {}}
        initialData={{
          metadata: { drink_type: 'formula', amount_ml: 100 },
          recordedAt: new Date('2025-01-15T09:00:00'),
        }}
      />,
    )
    expect(screen.getByText('마셔요 수정')).toBeInTheDocument()
  })

  it('shows 3 drink type buttons', () => {
    render(
      <DrinkSheet open={true} onOpenChange={() => {}} onSubmit={() => {}} />,
    )
    expect(screen.getByText('분유')).toBeInTheDocument()
    expect(screen.getByText('우유')).toBeInTheDocument()
    expect(screen.getByText('물')).toBeInTheDocument()
  })

  it('submit button is disabled when no drink type selected', () => {
    render(
      <DrinkSheet open={true} onOpenChange={() => {}} onSubmit={() => {}} />,
    )
    expect(screen.getByText('기록하기')).toBeDisabled()
  })

  it('submit button is enabled after selecting drink type', () => {
    render(
      <DrinkSheet open={true} onOpenChange={() => {}} onSubmit={() => {}} />,
    )

    fireEvent.click(screen.getByText('분유'))
    expect(screen.getByText('기록하기')).not.toBeDisabled()
  })

  it('calls onSubmit with drink type and amount', () => {
    const onSubmit = vi.fn()
    render(
      <DrinkSheet open={true} onOpenChange={() => {}} onSubmit={onSubmit} />,
    )

    fireEvent.click(screen.getByText('분유'))
    fireEvent.change(screen.getByPlaceholderText(/100/), { target: { value: '150' } })
    fireEvent.click(screen.getByText('기록하기'))

    expect(onSubmit).toHaveBeenCalledOnce()
    expect(onSubmit.mock.calls[0][0]).toEqual({ drink_type: 'formula', amount_ml: 150 })
  })

  it('loads defaults from store', () => {
    useDefaultsStore.getState().setDrinkDefaults('TESTFAM', 'water', '200')
    render(
      <DrinkSheet open={true} onOpenChange={() => {}} onSubmit={() => {}} />,
    )

    const amountInput = screen.getByPlaceholderText(/100/) as HTMLInputElement
    expect(amountInput.value).toBe('200')
  })
})
