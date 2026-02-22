import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import SleepDurationChart from './SleepDurationChart'
import { useStatsStore } from '@/stores/statsStore'
import type { SleepMetadata } from '@/types/database'
import { createMockActivity, resetMockActivityCounter } from '@/test/helpers/mockActivity'
import { getDateRange } from '@/lib/statsUtils'

// Mock recharts to avoid ResponsiveContainer dimension issues in jsdom
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  LabelList: () => <div />,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Cell: () => <div />,
}))

describe('SleepDurationChart', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15'))
    resetMockActivityCounter()
    useStatsStore.setState({
      sleepDurations: [],
      rawActivities: [],
      period: 'daily',
      dateRange: getDateRange('daily', new Date('2025-06-15')),
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders chart title', () => {
    render(<SleepDurationChart />)
    expect(screen.getByText('수면 시간')).toBeInTheDocument()
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

  describe('daily period — pie chart', () => {
    it('renders pie chart for daily period', () => {
      useStatsStore.setState({
        period: 'daily',
        dateRange: getDateRange('daily', new Date('2025-01-15')),
        sleepDurations: [{ date: '2025-01-15', minutes: 120 }],
        rawActivities: [
          createMockActivity({
            type: 'sleep',
            recorded_at: '2025-01-15T13:00:00',
            metadata: { note: '낮잠', end_time: '2025-01-15T15:00:00' } satisfies SleepMetadata,
          }),
        ],
      })
      render(<SleepDurationChart />)
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
      expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument()
    })

    it('shows total sleep time in center', () => {
      useStatsStore.setState({
        period: 'daily',
        dateRange: getDateRange('daily', new Date('2025-01-15')),
        sleepDurations: [{ date: '2025-01-15', minutes: 150 }],
        rawActivities: [
          createMockActivity({
            type: 'sleep',
            recorded_at: '2025-01-15T13:00:00',
            metadata: { note: '낮잠', end_time: '2025-01-15T15:30:00' } satisfies SleepMetadata,
          }),
        ],
      })
      render(<SleepDurationChart />)
      // 13:00~15:30 = 150분 = 2시간 30분
      expect(screen.getByTestId('total-sleep')).toHaveTextContent('2시간 30분')
    })

    it('shows clock labels', () => {
      useStatsStore.setState({
        period: 'daily',
        dateRange: getDateRange('daily', new Date('2025-01-15')),
        sleepDurations: [{ date: '2025-01-15', minutes: 60 }],
        rawActivities: [
          createMockActivity({
            type: 'sleep',
            recorded_at: '2025-01-15T13:00:00',
            metadata: { note: '', end_time: '2025-01-15T14:00:00' } satisfies SleepMetadata,
          }),
        ],
      })
      render(<SleepDurationChart />)
      expect(screen.getByText('0시')).toBeInTheDocument()
      expect(screen.getByText('6시')).toBeInTheDocument()
      expect(screen.getByText('12시')).toBeInTheDocument()
      expect(screen.getByText('18시')).toBeInTheDocument()
    })
  })

  describe('weekly/monthly period — bar chart', () => {
    it('renders bar chart for weekly period', () => {
      useStatsStore.setState({
        period: 'weekly',
        dateRange: getDateRange('weekly', new Date('2025-01-15')),
        sleepDurations: [{ date: '2025-01-15', minutes: 120 }],
      })
      render(<SleepDurationChart />)
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
      expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument()
    })

    it('renders bar chart for monthly period', () => {
      useStatsStore.setState({
        period: 'monthly',
        dateRange: getDateRange('monthly', new Date('2025-01-15')),
        sleepDurations: [{ date: '2025-01-15', minutes: 120 }],
      })
      render(<SleepDurationChart />)
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
      expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument()
    })
  })
})
