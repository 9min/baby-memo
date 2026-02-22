import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ActivityCountChart from './ActivityCountChart'
import { useStatsStore } from '@/stores/statsStore'

describe('ActivityCountChart', () => {
  beforeEach(() => {
    useStatsStore.setState({
      activityCounts: [],
      period: 'daily',
    })
  })

  it('renders chart title', () => {
    render(<ActivityCountChart />)
    expect(screen.getByText('활동 요약')).toBeInTheDocument()
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

  it('shows activity labels and counts when data exists', () => {
    useStatsStore.setState({
      activityCounts: [
        { date: '2025-06-15', counts: { solid_food: 2, drink: 3 }, total: 5 },
      ],
    })
    render(<ActivityCountChart />)
    expect(screen.queryByText('기록이 없습니다')).not.toBeInTheDocument()
    expect(screen.getByText('먹어요')).toBeInTheDocument()
    expect(screen.getByText('마셔요')).toBeInTheDocument()
    expect(screen.getByText('2회')).toBeInTheDocument()
    expect(screen.getByText('3회')).toBeInTheDocument()
  })

  it('shows all activity type labels', () => {
    useStatsStore.setState({
      activityCounts: [
        { date: '2025-06-15', counts: { solid_food: 1 }, total: 1 },
      ],
    })
    render(<ActivityCountChart />)
    expect(screen.getByText('먹어요')).toBeInTheDocument()
    expect(screen.getByText('마셔요')).toBeInTheDocument()
    expect(screen.getByText('영양제')).toBeInTheDocument()
    expect(screen.getByText('기저귀')).toBeInTheDocument()
    expect(screen.getByText('잠자요')).toBeInTheDocument()
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

  it('sums counts across multiple days', () => {
    useStatsStore.setState({
      activityCounts: [
        { date: '2025-06-15', counts: { solid_food: 2 }, total: 2 },
        { date: '2025-06-16', counts: { solid_food: 3 }, total: 3 },
      ],
    })
    render(<ActivityCountChart />)
    expect(screen.getByText('5회')).toBeInTheDocument()
  })

  it('shows 0회 for activity types with no records', () => {
    useStatsStore.setState({
      activityCounts: [
        { date: '2025-06-15', counts: { solid_food: 1 }, total: 1 },
      ],
    })
    render(<ActivityCountChart />)
    const zeroItems = screen.getAllByText('0회')
    expect(zeroItems.length).toBe(4) // drink, supplement, diaper, sleep
  })
})
