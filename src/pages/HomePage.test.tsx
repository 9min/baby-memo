import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HomePage from './HomePage'
import { useFamilyStore } from '@/stores/familyStore'
import { useActivityStore } from '@/stores/activityStore'
import { useDefaultsStore } from '@/stores/defaultsStore'
import { useSupplementStore } from '@/stores/supplementStore'
import { useBabyStore } from '@/stores/babyStore'
import { createMockActivity, resetMockActivityCounter } from '@/test/helpers/mockActivity'

function renderHomePage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  )
}

describe('HomePage', () => {
  beforeEach(() => {
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
      selectedDate: new Date(),
      setSelectedDate: vi.fn(),
      recordActivity: vi.fn(),
      updateActivity: vi.fn(),
    })
    useDefaultsStore.setState({ defaultsByFamily: {} })
    useSupplementStore.setState({
      presets: [],
      loading: false,
      fetchPresets: vi.fn(),
    })
    useBabyStore.setState({
      babies: [],
      loading: false,
    })
  })

  it('renders "활동 기록" heading', () => {
    renderHomePage()
    expect(screen.getByText('활동 기록')).toBeInTheDocument()
  })

  it('renders all 5 activity buttons', () => {
    renderHomePage()
    expect(screen.getByText('먹어요')).toBeInTheDocument()
    expect(screen.getByText('마셔요')).toBeInTheDocument()
    expect(screen.getByText('영양제')).toBeInTheDocument()
    expect(screen.getByText('잠자요')).toBeInTheDocument()
    expect(screen.getByText('기저귀')).toBeInTheDocument()
  })

  it('shows empty state when no activities', () => {
    renderHomePage()
    expect(screen.getByText('아직 기록이 없어요')).toBeInTheDocument()
  })

  it('shows recent activities', () => {
    useActivityStore.setState({
      activities: [
        createMockActivity({ type: 'solid_food', recorded_at: '2025-01-15T10:00:00' }),
      ],
    })
    renderHomePage()
    expect(screen.queryByText('아직 기록이 없어요')).not.toBeInTheDocument()
    expect(screen.getByText('감자죽')).toBeInTheDocument()
  })

  it('shows max 5 recent activities', () => {
    const activities = Array.from({ length: 7 }, (_, i) =>
      createMockActivity({
        id: `a${i}`,
        type: 'solid_food',
        recorded_at: `2025-01-15T${10 + i}:00:00`,
        metadata: { food_name: `음식${i}` },
      }),
    )
    useActivityStore.setState({ activities })
    renderHomePage()

    const foodNames = activities.slice(0, 5).map((a) => {
      const meta = a.metadata as { food_name: string }
      return meta.food_name
    })
    for (const name of foodNames) {
      expect(screen.getByText(name)).toBeInTheDocument()
    }
  })

  it('shows "더보기" link when activities exist', () => {
    useActivityStore.setState({
      activities: [createMockActivity()],
    })
    renderHomePage()
    expect(screen.getByText('더보기')).toBeInTheDocument()
  })

  it('does not show "더보기" link when no activities', () => {
    renderHomePage()
    expect(screen.queryByText('더보기')).not.toBeInTheDocument()
  })

  it('opens solid food sheet when 먹어요 button clicked', () => {
    renderHomePage()
    // Find the activity button (not the label in the card)
    const buttons = screen.getAllByText('먹어요')
    fireEvent.click(buttons[0])
    expect(screen.getByText('먹어요 기록')).toBeInTheDocument()
  })

  it('opens drink sheet when 마셔요 button clicked', () => {
    renderHomePage()
    const buttons = screen.getAllByText('마셔요')
    fireEvent.click(buttons[0])
    expect(screen.getByText('마셔요 기록')).toBeInTheDocument()
  })

  it('opens diaper sheet when 기저귀 button clicked', () => {
    renderHomePage()
    const buttons = screen.getAllByText('기저귀')
    fireEvent.click(buttons[0])
    expect(screen.getByText('기저귀 기록')).toBeInTheDocument()
  })

  it('opens sleep sheet when 잠자요 button clicked', () => {
    renderHomePage()
    const buttons = screen.getAllByText('잠자요')
    fireEvent.click(buttons[0])
    expect(screen.getByText('잠자요 기록')).toBeInTheDocument()
  })

  it('shows device nickname in activity cards', () => {
    useActivityStore.setState({
      activities: [
        createMockActivity({ type: 'solid_food', device_id: 'dev-1', recorded_at: '2025-01-15T10:00:00' }),
      ],
    })
    renderHomePage()
    expect(screen.getByText('귀여운 토끼')).toBeInTheDocument()
  })
})
