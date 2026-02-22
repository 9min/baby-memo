import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatsSummaryCard from './StatsSummaryCard'
import { useStatsStore } from '@/stores/statsStore'

describe('StatsSummaryCard', () => {
  beforeEach(() => {
    useStatsStore.setState({
      activityCounts: [],
      drinkIntakes: [],
      sleepDurations: [],
    })
  })

  it('renders summary labels', () => {
    render(<StatsSummaryCard />)
    expect(screen.getByText('전체 기록')).toBeInTheDocument()
    expect(screen.getByText('수분 섭취')).toBeInTheDocument()
    expect(screen.getByText('수면')).toBeInTheDocument()
  })

  it('shows 0건 when no activities', () => {
    render(<StatsSummaryCard />)
    expect(screen.getByText('0건')).toBeInTheDocument()
  })

  it('shows 0ml when no drinks', () => {
    render(<StatsSummaryCard />)
    expect(screen.getByText('0ml')).toBeInTheDocument()
  })

  it('shows 0m when no sleep', () => {
    render(<StatsSummaryCard />)
    expect(screen.getByText('0m')).toBeInTheDocument()
  })

  it('displays correct total activity count', () => {
    useStatsStore.setState({
      activityCounts: [
        { date: '2025-06-15', counts: { solid_food: 2, drink: 3 }, total: 5 },
      ],
    })
    render(<StatsSummaryCard />)
    expect(screen.getByText('5건')).toBeInTheDocument()
  })

  it('sums activity counts across multiple days', () => {
    useStatsStore.setState({
      activityCounts: [
        { date: '2025-06-14', counts: { solid_food: 1 }, total: 1 },
        { date: '2025-06-15', counts: { drink: 2 }, total: 2 },
      ],
    })
    render(<StatsSummaryCard />)
    expect(screen.getByText('3건')).toBeInTheDocument()
  })

  it('displays total drink ml', () => {
    useStatsStore.setState({
      drinkIntakes: [
        { date: '2025-06-15', intakes: { formula: 200, water: 50 }, total: 250 },
      ],
    })
    render(<StatsSummaryCard />)
    expect(screen.getByText('250ml')).toBeInTheDocument()
  })

  it('displays sleep in hours and minutes when >= 60 minutes', () => {
    useStatsStore.setState({
      sleepDurations: [
        { date: '2025-06-15', minutes: 150 },
      ],
    })
    render(<StatsSummaryCard />)
    expect(screen.getByText('2h 30m')).toBeInTheDocument()
  })

  it('displays sleep in minutes only when < 60 minutes', () => {
    useStatsStore.setState({
      sleepDurations: [
        { date: '2025-06-15', minutes: 45 },
      ],
    })
    render(<StatsSummaryCard />)
    expect(screen.getByText('45m')).toBeInTheDocument()
  })

  it('sums sleep across multiple days', () => {
    useStatsStore.setState({
      sleepDurations: [
        { date: '2025-06-14', minutes: 60 },
        { date: '2025-06-15', minutes: 90 },
      ],
    })
    render(<StatsSummaryCard />)
    expect(screen.getByText('2h 30m')).toBeInTheDocument()
  })
})
