import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatsPage from './StatsPage'
import { useFamilyStore } from '@/stores/familyStore'
import { useStatsStore } from '@/stores/statsStore'
import { resetAllStores } from '@/test/helpers/zustandTestUtils'

// Mock recharts to avoid ResponsiveContainer dimension issues in jsdom
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  LabelList: () => <div />,
}))

describe('StatsPage', () => {
  const mockFetchStats = vi.fn()

  beforeEach(() => {
    resetAllStores()
    mockFetchStats.mockClear()
    useFamilyStore.setState({ familyId: 'fam-1' })
    useStatsStore.setState({
      loading: false,
      fetchStats: mockFetchStats,
      activityCounts: [],
      drinkIntakes: [],
      sleepDurations: [],
    })
  })

  it('renders period tabs', () => {
    render(<StatsPage />)
    expect(screen.getByText('일별')).toBeInTheDocument()
    expect(screen.getByText('주별')).toBeInTheDocument()
    expect(screen.getByText('월별')).toBeInTheDocument()
  })

  it('renders summary labels when not loading', () => {
    render(<StatsPage />)
    expect(screen.getByText('전체 기록')).toBeInTheDocument()
    expect(screen.getByText('수분 섭취')).toBeInTheDocument()
    expect(screen.getByText('수면')).toBeInTheDocument()
  })

  it('calls fetchStats on mount with familyId', () => {
    render(<StatsPage />)
    expect(mockFetchStats).toHaveBeenCalledWith('fam-1')
  })

  it('does not call fetchStats when familyId is null', () => {
    useFamilyStore.setState({ familyId: null })
    render(<StatsPage />)
    expect(mockFetchStats).not.toHaveBeenCalled()
  })

  it('shows loading spinner when loading', () => {
    useStatsStore.setState({ loading: true })
    render(<StatsPage />)
    // Loading state hides the summary card
    expect(screen.queryByText('전체 기록')).not.toBeInTheDocument()
  })

  it('shows chart titles when not loading', () => {
    render(<StatsPage />)
    expect(screen.getByText('활동 요약')).toBeInTheDocument()
    expect(screen.getByText('수분 섭취량')).toBeInTheDocument()
    expect(screen.getByText('수면 시간')).toBeInTheDocument()
  })

  it('hides charts when loading', () => {
    useStatsStore.setState({ loading: true })
    render(<StatsPage />)
    expect(screen.queryByText('활동 요약')).not.toBeInTheDocument()
    expect(screen.queryByText('수분 섭취량')).not.toBeInTheDocument()
    expect(screen.queryByText('수면 시간')).not.toBeInTheDocument()
  })
})
