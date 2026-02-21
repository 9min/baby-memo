import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DateNavigator from './DateNavigator'

describe('DateNavigator', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-15T12:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows "오늘" prefix when date is today', () => {
    render(<DateNavigator date={new Date('2025-01-15')} onDateChange={() => {}} />)
    expect(screen.getByText(/오늘/)).toBeInTheDocument()
  })

  it('does not show "오늘" prefix for other dates', () => {
    render(<DateNavigator date={new Date('2025-01-14')} onDateChange={() => {}} />)
    expect(screen.queryByText(/오늘 ·/)).not.toBeInTheDocument()
  })

  it('shows "오늘" button for past dates', () => {
    render(<DateNavigator date={new Date('2025-01-14')} onDateChange={() => {}} />)
    expect(screen.getByText('오늘')).toBeInTheDocument()
  })

  it('disables next day button when date is today', () => {
    render(<DateNavigator date={new Date('2025-01-15')} onDateChange={() => {}} />)
    const nextBtn = screen.getByLabelText('다음 날짜')
    expect(nextBtn).toBeDisabled()
  })

  it('enables next day button for past dates', () => {
    render(<DateNavigator date={new Date('2025-01-14')} onDateChange={() => {}} />)
    const nextBtn = screen.getByLabelText('다음 날짜')
    expect(nextBtn).not.toBeDisabled()
  })

  it('calls onDateChange with previous day when prev clicked', () => {
    const onDateChange = vi.fn()
    render(<DateNavigator date={new Date('2025-01-15')} onDateChange={onDateChange} />)

    fireEvent.click(screen.getByLabelText('이전 날짜'))
    expect(onDateChange).toHaveBeenCalledTimes(1)
    const arg = onDateChange.mock.calls[0][0] as Date
    expect(arg.getDate()).toBe(14)
  })

  it('calls onDateChange with next day when next clicked', () => {
    const onDateChange = vi.fn()
    render(<DateNavigator date={new Date('2025-01-14')} onDateChange={onDateChange} />)

    fireEvent.click(screen.getByLabelText('다음 날짜'))
    expect(onDateChange).toHaveBeenCalledTimes(1)
    const arg = onDateChange.mock.calls[0][0] as Date
    expect(arg.getDate()).toBe(15)
  })

  it('calls onDateChange with today when "오늘" button clicked', () => {
    const onDateChange = vi.fn()
    render(<DateNavigator date={new Date('2025-01-10')} onDateChange={onDateChange} />)

    fireEvent.click(screen.getByText('오늘'))
    expect(onDateChange).toHaveBeenCalledTimes(1)
  })
})
