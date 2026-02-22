import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import SettingsPage from './SettingsPage'
import { useFamilyStore } from '@/stores/familyStore'
import { useSupplementStore } from '@/stores/supplementStore'
import { useDefaultsStore } from '@/stores/defaultsStore'
import { useBabyStore } from '@/stores/babyStore'
import { resetAllStores } from '@/test/helpers/zustandTestUtils'
import { renderWithRouter } from '@/test/helpers/renderWithRouter'

function renderSettingsPage() {
  return renderWithRouter(
    <Routes>
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/join" element={<div>Join Page</div>} />
    </Routes>,
    { initialEntries: ['/settings'] },
  )
}

describe('SettingsPage', () => {
  beforeEach(() => {
    resetAllStores()
    useFamilyStore.setState({
      familyId: 'fam-1',
      familyCode: 'TESTFAM',
      familyPassword: '1234',
      deviceId: 'dev-1',
      updatePassword: vi.fn(),
      leave: vi.fn(),
      deleteFamily: vi.fn(),
    })
    useSupplementStore.setState({
      presets: [],
      loading: false,
      fetchPresets: vi.fn(),
      addPreset: vi.fn(),
      deletePreset: vi.fn(),
      reorderPresets: vi.fn(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    })
    useDefaultsStore.setState({ defaultsByFamily: {} })
    useBabyStore.setState({
      babies: [],
      loading: false,
      fetchBabies: vi.fn(),
      addBaby: vi.fn(),
      deleteBaby: vi.fn(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    })
  })

  it('renders 설정 heading', () => {
    renderSettingsPage()
    expect(screen.getByText('설정')).toBeInTheDocument()
  })

  it('displays family code', () => {
    renderSettingsPage()
    const input = screen.getByDisplayValue('TESTFAM')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('readOnly')
  })

  it('shows 복사됨 after clicking copy button', async () => {
    const user = userEvent.setup()
    renderSettingsPage()

    await user.click(screen.getByText('복사'))
    expect(await screen.findByText('복사됨')).toBeInTheDocument()
  })

  it('shows current password', () => {
    renderSettingsPage()
    const pwInput = screen.getByDisplayValue('1234')
    expect(pwInput).toBeInTheDocument()
  })

  it('password save button is disabled when unchanged', () => {
    renderSettingsPage()
    expect(screen.getByText('저장')).toBeDisabled()
  })

  it('password save button is enabled when password changes', async () => {
    const user = userEvent.setup()
    renderSettingsPage()

    const pwInput = screen.getByDisplayValue('1234')
    await user.clear(pwInput)
    await user.type(pwInput, '5678')
    expect(screen.getByText('저장')).not.toBeDisabled()
  })

  it('shows per-device defaults notice', () => {
    renderSettingsPage()
    expect(screen.getByText(/기본값은 이 기기에만 저장됩니다/)).toBeInTheDocument()
  })

  it('shows solid food defaults section', () => {
    renderSettingsPage()
    expect(screen.getByText('먹어요')).toBeInTheDocument()
  })

  it('shows drink defaults section', () => {
    renderSettingsPage()
    expect(screen.getByText('마셔요')).toBeInTheDocument()
  })

  it('shows supplement section', () => {
    renderSettingsPage()
    expect(screen.getByText('영양제')).toBeInTheDocument()
  })

  it('shows diaper defaults section', () => {
    renderSettingsPage()
    expect(screen.getByText('기저귀')).toBeInTheDocument()
  })

  it('shows drink type buttons', () => {
    renderSettingsPage()
    expect(screen.getByText('분유')).toBeInTheDocument()
    expect(screen.getByText('우유')).toBeInTheDocument()
    expect(screen.getByText('물')).toBeInTheDocument()
  })

  it('shows diaper type buttons', () => {
    renderSettingsPage()
    expect(screen.getByText('소변')).toBeInTheDocument()
    expect(screen.getByText('대변')).toBeInTheDocument()
  })

  it('shows diaper amount buttons', () => {
    renderSettingsPage()
    expect(screen.getByText('조금')).toBeInTheDocument()
    expect(screen.getByText('보통')).toBeInTheDocument()
    expect(screen.getByText('많이')).toBeInTheDocument()
  })

  it('shows leave family button', () => {
    renderSettingsPage()
    expect(screen.getByText('가족방 나가기')).toBeInTheDocument()
  })

  it('shows leave confirmation dialog when leave button clicked', async () => {
    const user = userEvent.setup()
    renderSettingsPage()

    await user.click(screen.getByText('가족방 나가기'))
    expect(await screen.findByText('가족방을 나가시겠습니까?')).toBeInTheDocument()
  })

  it('renders delete family button', () => {
    renderSettingsPage()
    expect(screen.getByText('가족방 삭제하기')).toBeInTheDocument()
  })

  it('shows delete dialog with password input', async () => {
    const user = userEvent.setup()
    renderSettingsPage()

    await user.click(screen.getByText('가족방 삭제하기'))
    expect(await screen.findByText('가족방을 삭제하시겠습니까?')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('비밀번호 4자리')).toBeInTheDocument()
  })

  it('delete button is disabled when password is incomplete', async () => {
    const user = userEvent.setup()
    renderSettingsPage()

    await user.click(screen.getByText('가족방 삭제하기'))
    await screen.findByText('가족방을 삭제하시겠습니까?')
    expect(screen.getByText('삭제하기')).toBeDisabled()
  })

  it('calls deleteFamily with correct password', async () => {
    const deleteFamily = vi.fn().mockResolvedValue(undefined)
    useFamilyStore.setState({ deleteFamily })
    const user = userEvent.setup()
    renderSettingsPage()

    await user.click(screen.getByText('가족방 삭제하기'))
    await screen.findByText('가족방을 삭제하시겠습니까?')

    await user.type(screen.getByPlaceholderText('비밀번호 4자리'), '1234')
    await user.click(screen.getByText('삭제하기'))

    expect(deleteFamily).toHaveBeenCalledWith('1234')
  })

  it('shows error message on wrong password', async () => {
    const deleteFamily = vi.fn().mockRejectedValue(new Error('비밀번호가 일치하지 않습니다.'))
    useFamilyStore.setState({ deleteFamily })
    const user = userEvent.setup()
    renderSettingsPage()

    await user.click(screen.getByText('가족방 삭제하기'))
    await screen.findByText('가족방을 삭제하시겠습니까?')

    await user.type(screen.getByPlaceholderText('비밀번호 4자리'), '9999')
    await user.click(screen.getByText('삭제하기'))

    expect(await screen.findByText('비밀번호가 일치하지 않습니다.')).toBeInTheDocument()
  })

  it('shows supplement preset list', () => {
    useSupplementStore.setState({
      presets: [
        { id: 'p1', family_id: 'fam-1', name: '비타민D', sort_order: 0, created_at: '2025-01-01' },
      ],
    })
    renderSettingsPage()
    expect(screen.getByText('비타민D')).toBeInTheDocument()
  })

  it('shows empty state when no supplement presets', () => {
    renderSettingsPage()
    expect(screen.getByText('등록된 영양제가 없습니다')).toBeInTheDocument()
  })

  it('can add new supplement preset', async () => {
    const user = userEvent.setup()
    const addPreset = vi.fn().mockResolvedValue(undefined)
    useSupplementStore.setState({ addPreset })
    renderSettingsPage()

    await user.type(screen.getByPlaceholderText('영양제 이름 추가'), '오메가3')
    const addButtons = screen.getAllByText('추가')
    // The supplement add button is the second one (baby profile add is first)
    await user.click(addButtons[1])

    expect(addPreset).toHaveBeenCalledWith('fam-1', '오메가3')
  })
})
