import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import SleepDurationChart from './SleepDurationChart'
import { useStatsStore } from '@/stores/statsStore'

// Mock recharts to avoid ResponsiveContainer dimension issues in jsdom
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
}))

describe('SleepDurationChart', () => {
  beforeEach(() => {
    useStatsStore.setState({
      sleepDurations: [],
      period: 'daily',
    })
  })

  it('renders chart title', () => {
    render(<SleepDurationChart />)
    expect(screen.getByText('수면 시간 (h)')).toBeInTheDocument()
  })

  it('shows empty message when no data', () => {
    useStatsStore.setState({
      sleepDurations: [
        { date: '2025-06-15', minutes: 0 },
      ],
    })
    render(<SleepDurationChart />)
    expect(screen.getByText('기록이 없습니다')).toBeInTheDocument()
  })

  it('shows chart when data exists', () => {
    useStatsStore.setState({
      sleepDurations: [
        { date: '2025-06-15', minutes: 120 },
      ],
    })
    render(<SleepDurationChart />)
    expect(screen.queryByText('기록이 없습니다')).not.toBeInTheDocument()
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })

  it('shows empty message when all minutes are 0', () => {
    useStatsStore.setState({
      sleepDurations: [
        { date: '2025-06-15', minutes: 0 },
        { date: '2025-06-16', minutes: 0 },
      ],
    })
    render(<SleepDurationChart />)
    expect(screen.getByText('기록이 없습니다')).toBeInTheDocument()
  })
})
