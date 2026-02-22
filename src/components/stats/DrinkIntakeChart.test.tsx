import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import DrinkIntakeChart from './DrinkIntakeChart'
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

describe('DrinkIntakeChart', () => {
  beforeEach(() => {
    useStatsStore.setState({
      drinkIntakes: [],
      period: 'daily',
    })
  })

  it('renders chart title', () => {
    render(<DrinkIntakeChart />)
    expect(screen.getByText('수분 섭취량')).toBeInTheDocument()
  })

  it('shows empty message when no data', () => {
    useStatsStore.setState({
      drinkIntakes: [
        { date: '2025-06-15', intakes: {}, total: 0 },
      ],
    })
    render(<DrinkIntakeChart />)
    expect(screen.getByText('기록이 없습니다')).toBeInTheDocument()
  })

  it('shows chart when data exists', () => {
    useStatsStore.setState({
      drinkIntakes: [
        { date: '2025-06-15', intakes: { formula: 200 }, total: 200 },
      ],
    })
    render(<DrinkIntakeChart />)
    expect(screen.queryByText('기록이 없습니다')).not.toBeInTheDocument()
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })

  it('shows empty message when all totals are 0', () => {
    useStatsStore.setState({
      drinkIntakes: [
        { date: '2025-06-15', intakes: {}, total: 0 },
        { date: '2025-06-16', intakes: {}, total: 0 },
      ],
    })
    render(<DrinkIntakeChart />)
    expect(screen.getByText('기록이 없습니다')).toBeInTheDocument()
  })
})
