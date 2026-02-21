import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DiaperSheet from './DiaperSheet'
import { useFamilyStore } from '@/stores/familyStore'
import { useDefaultsStore } from '@/stores/defaultsStore'

describe('DiaperSheet', () => {
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
      <DiaperSheet open={true} onOpenChange={() => {}} onSubmit={() => {}} />,
    )
    expect(screen.getByText('기저귀 기록')).toBeInTheDocument()
  })

  it('renders title for editing', () => {
    render(
      <DiaperSheet
        open={true}
        onOpenChange={() => {}}
        onSubmit={() => {}}
        initialData={{
          metadata: { diaper_type: 'pee', amount: 'normal' },
          recordedAt: new Date('2025-01-15T09:00:00'),
        }}
      />,
    )
    expect(screen.getByText('기저귀 수정')).toBeInTheDocument()
  })

  it('shows diaper type buttons', () => {
    render(
      <DiaperSheet open={true} onOpenChange={() => {}} onSubmit={() => {}} />,
    )
    expect(screen.getByText('소변')).toBeInTheDocument()
    expect(screen.getByText('대변')).toBeInTheDocument()
  })

  it('shows amount buttons', () => {
    render(
      <DiaperSheet open={true} onOpenChange={() => {}} onSubmit={() => {}} />,
    )
    expect(screen.getByText('조금')).toBeInTheDocument()
    expect(screen.getByText('보통')).toBeInTheDocument()
    expect(screen.getByText('많이')).toBeInTheDocument()
  })

  it('submit button is disabled when no type or amount selected', () => {
    render(
      <DiaperSheet open={true} onOpenChange={() => {}} onSubmit={() => {}} />,
    )
    expect(screen.getByText('기록하기')).toBeDisabled()
  })

  it('submit button is enabled when type and amount both selected', () => {
    render(
      <DiaperSheet open={true} onOpenChange={() => {}} onSubmit={() => {}} />,
    )

    fireEvent.click(screen.getByText('소변'))
    fireEvent.click(screen.getByText('보통'))
    expect(screen.getByText('기록하기')).not.toBeDisabled()
  })

  it('calls onSubmit with diaper type and amount', () => {
    const onSubmit = vi.fn()
    render(
      <DiaperSheet open={true} onOpenChange={() => {}} onSubmit={onSubmit} />,
    )

    fireEvent.click(screen.getByText('대변'))
    fireEvent.click(screen.getByText('많이'))
    fireEvent.click(screen.getByText('기록하기'))

    expect(onSubmit).toHaveBeenCalledOnce()
    expect(onSubmit.mock.calls[0][0]).toEqual({ diaper_type: 'poo', amount: 'much' })
  })

  it('loads defaults from store', () => {
    useDefaultsStore.getState().setDiaperDefaults('TESTFAM', 'pee', 'little')
    render(
      <DiaperSheet open={true} onOpenChange={() => {}} onSubmit={() => {}} />,
    )
    expect(screen.getByText('기록하기')).not.toBeDisabled()
  })
})
