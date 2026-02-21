import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import SupplementSheet from './SupplementSheet'
import { useFamilyStore } from '@/stores/familyStore'
import { useSupplementStore } from '@/stores/supplementStore'
import { useDefaultsStore } from '@/stores/defaultsStore'

describe('SupplementSheet', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-15T10:30:00'))
    useFamilyStore.setState({ familyId: 'fam-1', familyCode: 'TESTFAM' })
    useDefaultsStore.setState({ defaultsByFamily: {} })
    useSupplementStore.setState({
      presets: [],
      loading: false,
      fetchPresets: vi.fn(),
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders title for new record', () => {
    render(
      <SupplementSheet open={true} onOpenChange={() => {}} onSubmit={() => {}} />,
    )
    expect(screen.getByText('영양제 기록')).toBeInTheDocument()
  })

  it('renders title for editing', () => {
    render(
      <SupplementSheet
        open={true}
        onOpenChange={() => {}}
        onSubmit={() => {}}
        initialData={{
          metadata: { supplement_names: ['비타민D'] },
          recordedAt: new Date('2025-01-15T09:00:00'),
        }}
      />,
    )
    expect(screen.getByText('영양제 수정')).toBeInTheDocument()
  })

  it('shows empty state when no presets', () => {
    render(
      <SupplementSheet open={true} onOpenChange={() => {}} onSubmit={() => {}} />,
    )
    expect(screen.getByText('등록된 영양제가 없습니다')).toBeInTheDocument()
  })

  it('shows presets as selectable items', () => {
    useSupplementStore.setState({
      presets: [
        { id: 'p1', family_id: 'fam-1', name: '비타민D', created_at: '2025-01-01' },
        { id: 'p2', family_id: 'fam-1', name: '오메가3', created_at: '2025-01-01' },
      ],
    })
    render(
      <SupplementSheet open={true} onOpenChange={() => {}} onSubmit={() => {}} />,
    )
    expect(screen.getByText('비타민D')).toBeInTheDocument()
    expect(screen.getByText('오메가3')).toBeInTheDocument()
  })

  it('submit button is disabled when no supplements selected', () => {
    useSupplementStore.setState({
      presets: [
        { id: 'p1', family_id: 'fam-1', name: '비타민D', created_at: '2025-01-01' },
      ],
    })
    render(
      <SupplementSheet open={true} onOpenChange={() => {}} onSubmit={() => {}} />,
    )
    expect(screen.getByText('기록하기')).toBeDisabled()
  })

  it('fetches presets when opened', () => {
    const fetchPresets = vi.fn()
    useSupplementStore.setState({ fetchPresets })
    render(
      <SupplementSheet open={true} onOpenChange={() => {}} onSubmit={() => {}} />,
    )
    expect(fetchPresets).toHaveBeenCalledWith('fam-1')
  })
})
