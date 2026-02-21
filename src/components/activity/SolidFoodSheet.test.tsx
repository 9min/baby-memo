import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SolidFoodSheet from './SolidFoodSheet'
import { useFamilyStore } from '@/stores/familyStore'
import { useDefaultsStore } from '@/stores/defaultsStore'

describe('SolidFoodSheet', () => {
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
      <SolidFoodSheet open={true} onOpenChange={() => {}} onSubmit={() => {}} />,
    )
    expect(screen.getByText('먹어요 기록')).toBeInTheDocument()
  })

  it('renders title for editing', () => {
    render(
      <SolidFoodSheet
        open={true}
        onOpenChange={() => {}}
        onSubmit={() => {}}
        initialData={{
          metadata: { food_name: '감자죽' },
          recordedAt: new Date('2025-01-15T09:00:00'),
        }}
      />,
    )
    expect(screen.getByText('먹어요 수정')).toBeInTheDocument()
  })

  it('submit button is disabled when food name is empty', () => {
    render(
      <SolidFoodSheet open={true} onOpenChange={() => {}} onSubmit={() => {}} />,
    )
    expect(screen.getByText('기록하기')).toBeDisabled()
  })

  it('submit button is enabled when food name is provided', () => {
    render(
      <SolidFoodSheet open={true} onOpenChange={() => {}} onSubmit={() => {}} />,
    )

    const input = screen.getByPlaceholderText(/감자죽/)
    fireEvent.change(input, { target: { value: '바나나' } })
    expect(screen.getByText('기록하기')).not.toBeDisabled()
  })

  it('calls onSubmit with food name and time', () => {
    const onSubmit = vi.fn()
    render(
      <SolidFoodSheet open={true} onOpenChange={() => {}} onSubmit={onSubmit} />,
    )

    const input = screen.getByPlaceholderText(/감자죽/)
    fireEvent.change(input, { target: { value: '바나나' } })
    fireEvent.click(screen.getByText('기록하기'))

    expect(onSubmit).toHaveBeenCalledOnce()
    expect(onSubmit.mock.calls[0][0]).toEqual({ food_name: '바나나' })
  })

  it('loads defaults when opening without initial data', () => {
    useDefaultsStore.getState().setSolidFoodDefaults('TESTFAM', '기본죽')
    render(
      <SolidFoodSheet open={true} onOpenChange={() => {}} onSubmit={() => {}} />,
    )

    const input = screen.getByPlaceholderText(/감자죽/) as HTMLInputElement
    expect(input.value).toBe('기본죽')
  })

  it('loads initial data when editing', () => {
    render(
      <SolidFoodSheet
        open={true}
        onOpenChange={() => {}}
        onSubmit={() => {}}
        initialData={{
          metadata: { food_name: '감자죽' },
          recordedAt: new Date('2025-01-15T09:00:00'),
        }}
      />,
    )

    const input = screen.getByPlaceholderText(/감자죽/) as HTMLInputElement
    expect(input.value).toBe('감자죽')
  })

  it('shows 수정하기 button when editing', () => {
    render(
      <SolidFoodSheet
        open={true}
        onOpenChange={() => {}}
        onSubmit={() => {}}
        initialData={{
          metadata: { food_name: '감자죽' },
          recordedAt: new Date('2025-01-15T09:00:00'),
        }}
      />,
    )
    expect(screen.getByText('수정하기')).toBeInTheDocument()
  })
})
