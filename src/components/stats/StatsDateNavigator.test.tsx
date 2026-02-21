import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import StatsDateNavigator from './StatsDateNavigator'
import { useStatsStore } from '@/stores/statsStore'
import { getDateRange } from '@/lib/statsUtils'

describe('StatsDateNavigator', () => {
  const mockNavigatePrev = vi.fn()
  const mockNavigateNext = vi.fn()
  const mockGoToToday = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    const anchor = new Date('2025-06-15')
    useStatsStore.setState({
      period: 'daily',
      anchorDate: anchor,
      dateRange: getDateRange('daily', anchor),
      navigatePrev: mockNavigatePrev,
      navigateNext: mockNavigateNext,
      goToToday: mockGoToToday,
    })
  })

  it('displays the formatted period label', () => {
    render(<StatsDateNavigator />)
    expect(screen.getByText(/6월 15일/)).toBeInTheDocument()
  })

  it('calls navigatePrev when left arrow is clicked', () => {
    render(<StatsDateNavigator />)
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[0])
    expect(mockNavigatePrev).toHaveBeenCalledTimes(1)
  })

  it('calls navigateNext when right arrow is clicked', () => {
    render(<StatsDateNavigator />)
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[buttons.length - 1])
    expect(mockNavigateNext).toHaveBeenCalledTimes(1)
  })

  it('calls goToToday when label is clicked', () => {
    render(<StatsDateNavigator />)
    fireEvent.click(screen.getByText(/6월 15일/))
    expect(mockGoToToday).toHaveBeenCalledTimes(1)
  })

  it('shows weekly range label for weekly period', () => {
    const anchor = new Date('2025-06-15')
    useStatsStore.setState({
      period: 'weekly',
      dateRange: getDateRange('weekly', anchor),
    })
    render(<StatsDateNavigator />)
    expect(screen.getByText(/~/)).toBeInTheDocument()
  })

  it('shows monthly label for monthly period', () => {
    const anchor = new Date('2025-06-15')
    useStatsStore.setState({
      period: 'monthly',
      dateRange: getDateRange('monthly', anchor),
    })
    render(<StatsDateNavigator />)
    expect(screen.getByText('2025년 6월')).toBeInTheDocument()
  })
})
