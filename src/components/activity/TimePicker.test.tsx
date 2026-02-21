import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TimePicker from './TimePicker'
import { roundToNearest5 } from '@/lib/timeUtils'

describe('roundToNearest5', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-15T23:59:59'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('rounds 10:02 down to 10:00', () => {
    const result = roundToNearest5(new Date('2025-01-15T10:02:30'))
    expect(result.getMinutes()).toBe(0)
  })

  it('rounds 10:03 up to 10:05', () => {
    const result = roundToNearest5(new Date('2025-01-15T10:03:30'))
    expect(result.getMinutes()).toBe(5)
  })

  it('keeps 10:05 as 10:05', () => {
    const result = roundToNearest5(new Date('2025-01-15T10:05:00'))
    expect(result.getMinutes()).toBe(5)
  })

  it('rounds 10:07 down to 10:05', () => {
    const result = roundToNearest5(new Date('2025-01-15T10:07:30'))
    expect(result.getMinutes()).toBe(5)
  })

  it('rounds 10:08 up to 10:10', () => {
    const result = roundToNearest5(new Date('2025-01-15T10:08:00'))
    expect(result.getMinutes()).toBe(10)
  })

  it('sets seconds and milliseconds to 0', () => {
    const result = roundToNearest5(new Date('2025-01-15T10:05:30.500'))
    expect(result.getSeconds()).toBe(0)
    expect(result.getMilliseconds()).toBe(0)
  })

  it('prevents rounding to future time', () => {
    vi.setSystemTime(new Date('2025-01-15T10:06:00'))
    const result = roundToNearest5(new Date('2025-01-15T10:08:00'))
    expect(result.getMinutes()).toBe(5)
  })
})

describe('TimePicker', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-15T15:30:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('displays the time', () => {
    render(
      <TimePicker value={new Date('2025-01-15T10:30:00')} onChange={() => {}} />,
    )
    expect(screen.getByText(/10:30/)).toBeInTheDocument()
  })

  it('shows custom label', () => {
    render(
      <TimePicker
        value={new Date('2025-01-15T10:30:00')}
        onChange={() => {}}
        label="시작 시간"
      />,
    )
    expect(screen.getByText('시작 시간')).toBeInTheDocument()
  })

  it('shows default label "시간"', () => {
    render(
      <TimePicker value={new Date('2025-01-15T10:30:00')} onChange={() => {}} />,
    )
    expect(screen.getByText('시간')).toBeInTheDocument()
  })

  it('has -5 and +5 buttons', () => {
    render(
      <TimePicker value={new Date('2025-01-15T10:30:00')} onChange={() => {}} />,
    )
    expect(screen.getByText('-5')).toBeInTheDocument()
    expect(screen.getByText('+5')).toBeInTheDocument()
  })

  it('calls onChange with -5 minutes when minus button clicked', () => {
    const onChange = vi.fn()
    render(
      <TimePicker value={new Date('2025-01-15T10:30:00')} onChange={onChange} />,
    )

    fireEvent.click(screen.getByText('-5'))
    expect(onChange).toHaveBeenCalledOnce()
    const arg = onChange.mock.calls[0][0] as Date
    expect(arg.getMinutes()).toBe(25)
  })

  it('disables +5 when it would result in future time', () => {
    vi.setSystemTime(new Date('2025-01-15T10:32:00'))
    render(
      <TimePicker value={new Date('2025-01-15T10:30:00')} onChange={() => {}} />,
    )
    expect(screen.getByText('+5')).toBeDisabled()
  })

  it('enters edit mode when time display is clicked', () => {
    render(
      <TimePicker value={new Date('2025-01-15T10:30:00')} onChange={() => {}} />,
    )

    fireEvent.click(screen.getByText(/10:30/))
    expect(screen.getByText('확인')).toBeInTheDocument()
  })

  it('exits edit mode when 확인 is clicked', () => {
    render(
      <TimePicker value={new Date('2025-01-15T10:30:00')} onChange={() => {}} />,
    )

    fireEvent.click(screen.getByText(/10:30/))
    expect(screen.getByText('확인')).toBeInTheDocument()

    fireEvent.click(screen.getByText('확인'))
    expect(screen.queryByText('확인')).not.toBeInTheDocument()
  })
})
