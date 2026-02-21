import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TimelinePage from './TimelinePage'
import { useFamilyStore } from '@/stores/familyStore'
import { useActivityStore } from '@/stores/activityStore'
import { useDefaultsStore } from '@/stores/defaultsStore'
import { createMockActivity, resetMockActivityCounter } from '@/test/helpers/mockActivity'

function renderTimelinePage() {
  return render(
    <MemoryRouter>
      <TimelinePage />
    </MemoryRouter>,
  )
}

describe('TimelinePage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-15T12:00:00'))
    resetMockActivityCounter()
    useFamilyStore.setState({
      familyId: 'fam-1',
      familyCode: 'TESTFAM',
      deviceId: 'dev-1',
      members: [
        { id: '1', device_id: 'dev-1', family_id: 'fam-1', nickname: '귀여운 토끼', created_at: '2025-01-01', updated_at: '2025-01-01' },
      ],
    })
    useActivityStore.setState({
      activities: [],
      loading: false,
      selectedDate: new Date('2025-01-15'),
      setSelectedDate: vi.fn(),
    })
    useDefaultsStore.setState({ defaultsByFamily: {} })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders DateNavigator', () => {
    renderTimelinePage()
    expect(screen.getByLabelText('이전 날짜')).toBeInTheDocument()
    expect(screen.getByLabelText('다음 날짜')).toBeInTheDocument()
  })

  it('shows empty state when no activities', () => {
    renderTimelinePage()
    expect(screen.getByText('이 날짜에 기록된 활동이 없습니다')).toBeInTheDocument()
  })

  it('shows loading skeletons when loading', () => {
    useActivityStore.setState({ loading: true })
    renderTimelinePage()
    // Should show 3 placeholder elements
    expect(screen.queryByText('이 날짜에 기록된 활동이 없습니다')).not.toBeInTheDocument()
  })

  it('groups activities by time of day', () => {
    useActivityStore.setState({
      activities: [
        createMockActivity({ recorded_at: '2025-01-15T08:00:00', type: 'solid_food' }),
        createMockActivity({ recorded_at: '2025-01-15T14:00:00', type: 'drink', metadata: { drink_type: 'formula', amount_ml: 100 } }),
        createMockActivity({ recorded_at: '2025-01-15T20:00:00', type: 'sleep', metadata: { note: '', end_time: null } }),
      ],
    })
    renderTimelinePage()

    expect(screen.getByText('오전')).toBeInTheDocument()
    expect(screen.getByText('오후')).toBeInTheDocument()
    expect(screen.getByText('저녁/밤')).toBeInTheDocument()
  })

  it('shows activity count per group', () => {
    useActivityStore.setState({
      activities: [
        createMockActivity({ recorded_at: '2025-01-15T08:00:00' }),
        createMockActivity({ recorded_at: '2025-01-15T09:00:00' }),
      ],
    })
    renderTimelinePage()
    expect(screen.getByText('2건')).toBeInTheDocument()
  })

  it('shows only groups that have activities', () => {
    useActivityStore.setState({
      activities: [
        createMockActivity({ recorded_at: '2025-01-15T08:00:00' }),
      ],
    })
    renderTimelinePage()
    expect(screen.getByText('오전')).toBeInTheDocument()
    expect(screen.queryByText('오후')).not.toBeInTheDocument()
    expect(screen.queryByText('저녁/밤')).not.toBeInTheDocument()
  })

  it('shows device nickname in activity cards', () => {
    useActivityStore.setState({
      activities: [
        createMockActivity({ recorded_at: '2025-01-15T08:00:00', device_id: 'dev-1' }),
      ],
    })
    renderTimelinePage()
    expect(screen.getByText('귀여운 토끼')).toBeInTheDocument()
  })
})
