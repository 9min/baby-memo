import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ActivityCountChart from './ActivityCountChart'
import { useStatsStore } from '@/stores/statsStore'

// Mock recharts to avoid ResponsiveContainer dimension issues in jsdom
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
}))

describe('ActivityCountChart', () => {
  beforeEach(() => {
    useStatsStore.setState({
      activityCounts: [],
      period: 'daily',
    })
  })

  it('renders chart title', () => {
    render(<ActivityCountChart />)
    expect(screen.getByText('활동 횟수')).toBeInTheDocument()
  })

  it('shows empty message when no data', () => {
    useStatsStore.setState({
      activityCounts: [
        { date: '2025-06-15', counts: {}, total: 0 },
      ],
    })
    render(<ActivityCountChart />)
    expect(screen.getByText('기록이 없습니다')).toBeInTheDocument()
  })

  it('shows chart when data exists', () => {
    useStatsStore.setState({
      activityCounts: [
        { date: '2025-06-15', counts: { solid_food: 2 }, total: 2 },
      ],
    })
    render(<ActivityCountChart />)
    expect(screen.queryByText('기록이 없습니다')).not.toBeInTheDocument()
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })

  it('shows empty message when all totals are 0', () => {
    useStatsStore.setState({
      activityCounts: [
        { date: '2025-06-15', counts: {}, total: 0 },
        { date: '2025-06-16', counts: {}, total: 0 },
      ],
    })
    render(<ActivityCountChart />)
    expect(screen.getByText('기록이 없습니다')).toBeInTheDocument()
  })
})
