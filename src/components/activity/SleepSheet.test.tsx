import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SleepSheet from './SleepSheet'

describe('SleepSheet', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-15T10:30:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders title for new record', () => {
    render(
      <SleepSheet open={true} onOpenChange={() => {}} onSubmit={() => {}} />,
    )
    expect(screen.getByText('잠자요 기록')).toBeInTheDocument()
  })

  it('renders title for editing', () => {
    render(
      <SleepSheet
        open={true}
        onOpenChange={() => {}}
        onSubmit={() => {}}
        initialData={{
          metadata: { note: '낮잠', end_time: null },
          recordedAt: new Date('2025-01-15T09:00:00'),
        }}
      />,
    )
    expect(screen.getByText('잠자요 수정')).toBeInTheDocument()
  })

  it('submit button is always enabled (no required fields)', () => {
    render(
      <SleepSheet open={true} onOpenChange={() => {}} onSubmit={() => {}} />,
    )
    expect(screen.getByText('기록하기')).not.toBeDisabled()
  })

  it('shows "종료 시간 추가" button initially', () => {
    render(
      <SleepSheet open={true} onOpenChange={() => {}} onSubmit={() => {}} />,
    )
    expect(screen.getByText('종료 시간 추가')).toBeInTheDocument()
  })

  it('shows end time picker when "종료 시간 추가" is clicked', () => {
    render(
      <SleepSheet open={true} onOpenChange={() => {}} onSubmit={() => {}} />,
    )

    fireEvent.click(screen.getByText('종료 시간 추가'))
    expect(screen.getByText('종료 시간')).toBeInTheDocument()
    expect(screen.getByLabelText('종료 시간 제거')).toBeInTheDocument()
  })

  it('removes end time when X button is clicked', () => {
    render(
      <SleepSheet open={true} onOpenChange={() => {}} onSubmit={() => {}} />,
    )

    fireEvent.click(screen.getByText('종료 시간 추가'))
    expect(screen.getByText('종료 시간')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('종료 시간 제거'))
    expect(screen.queryByText('종료 시간')).not.toBeInTheDocument()
  })

  it('calls onSubmit with note and no end_time', () => {
    const onSubmit = vi.fn()
    render(
      <SleepSheet open={true} onOpenChange={() => {}} onSubmit={onSubmit} />,
    )

    fireEvent.change(screen.getByPlaceholderText(/낮잠/), { target: { value: '낮잠' } })
    fireEvent.click(screen.getByText('기록하기'))

    expect(onSubmit).toHaveBeenCalledOnce()
    expect(onSubmit.mock.calls[0][0].note).toBe('낮잠')
    expect(onSubmit.mock.calls[0][0].end_time).toBeNull()
  })

  it('shows memo input', () => {
    render(
      <SleepSheet open={true} onOpenChange={() => {}} onSubmit={() => {}} />,
    )
    expect(screen.getByPlaceholderText(/낮잠/)).toBeInTheDocument()
  })

  it('loads initial data when editing', () => {
    render(
      <SleepSheet
        open={true}
        onOpenChange={() => {}}
        onSubmit={() => {}}
        initialData={{
          metadata: { note: '낮잠', end_time: '2025-01-15T11:00:00.000Z' },
          recordedAt: new Date('2025-01-15T09:00:00'),
        }}
      />,
    )

    const noteInput = screen.getByPlaceholderText(/낮잠/) as HTMLInputElement
    expect(noteInput.value).toBe('낮잠')
    expect(screen.getByText('종료 시간')).toBeInTheDocument()
  })
})
