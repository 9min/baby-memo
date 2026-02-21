import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PeriodTabs from './PeriodTabs'
import { useStatsStore } from '@/stores/statsStore'
import { getDateRange } from '@/lib/statsUtils'

describe('PeriodTabs', () => {
  beforeEach(() => {
    const now = new Date('2025-06-15')
    useStatsStore.setState({
      period: 'daily',
      anchorDate: now,
      dateRange: getDateRange('daily', now),
      setPeriod: vi.fn((period) => {
        useStatsStore.setState({ period })
      }),
    })
  })

  it('renders all three period labels', () => {
    render(<PeriodTabs />)
    expect(screen.getByText('일별')).toBeInTheDocument()
    expect(screen.getByText('주별')).toBeInTheDocument()
    expect(screen.getByText('월별')).toBeInTheDocument()
  })

  it('daily tab is selected by default', () => {
    render(<PeriodTabs />)
    const dailyTab = screen.getByText('일별')
    expect(dailyTab).toHaveAttribute('data-state', 'active')
  })

  it('calls setPeriod when tab is clicked', async () => {
    const user = userEvent.setup()
    const setPeriod = vi.fn()
    useStatsStore.setState({ setPeriod })
    render(<PeriodTabs />)

    await user.click(screen.getByText('주별'))
    expect(setPeriod).toHaveBeenCalledWith('weekly')
  })

  it('reflects weekly period state', () => {
    useStatsStore.setState({ period: 'weekly' })
    render(<PeriodTabs />)
    expect(screen.getByText('주별')).toHaveAttribute('data-state', 'active')
  })

  it('reflects monthly period state', () => {
    useStatsStore.setState({ period: 'monthly' })
    render(<PeriodTabs />)
    expect(screen.getByText('월별')).toHaveAttribute('data-state', 'active')
  })
})
