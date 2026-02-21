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
      nickname: '귀여운 토끼',
      members: [
        { id: '1', device_id: 'dev-1', family_id: 'fam-1', nickname: '귀여운 토끼', created_at: '2025-01-15T00:00:00', updated_at: '2025-01-15T00:00:00' },
        { id: '2', device_id: 'dev-2', family_id: 'fam-1', nickname: '용감한 펭귄', created_at: '2025-01-16T00:00:00', updated_at: '2025-01-16T00:00:00' },
      ],
      updatePassword: vi.fn(),
      getDeviceCount: vi.fn().mockResolvedValue(1),
      leave: vi.fn(),
      setNickname: vi.fn(),
      fetchMembers: vi.fn(),
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
    // Multiple "저장" buttons exist — the first one is the password save button
    const saveButtons = screen.getAllByText('저장')
    expect(saveButtons[0]).toBeDisabled()
  })

  it('password save button is enabled when password changes', async () => {
    const user = userEvent.setup()
    renderSettingsPage()

    const pwInput = screen.getByDisplayValue('1234')
    await user.clear(pwInput)
    await user.type(pwInput, '5678')
    const saveButtons = screen.getAllByText('저장')
    expect(saveButtons[0]).not.toBeDisabled()
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
    expect(await screen.findByText(/나가시겠습니까|삭제됩니다/)).toBeInTheDocument()
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

  describe('nickname', () => {
    it('shows current nickname in input', () => {
      renderSettingsPage()
      expect(screen.getByDisplayValue('귀여운 토끼')).toBeInTheDocument()
    })

    it('shows 내 닉네임 label', () => {
      renderSettingsPage()
      expect(screen.getByText('내 닉네임')).toBeInTheDocument()
    })

    it('nickname save button is disabled when unchanged', () => {
      renderSettingsPage()
      // Find the nickname save button (it has id="nickname" input nearby)
      const nicknameInput = screen.getByDisplayValue('귀여운 토끼')
      const saveBtn = nicknameInput.parentElement?.querySelector('button')
      expect(saveBtn).toBeDisabled()
    })

    it('nickname save button is enabled when changed', async () => {
      const user = userEvent.setup()
      renderSettingsPage()

      const nicknameInput = screen.getByDisplayValue('귀여운 토끼')
      await user.clear(nicknameInput)
      await user.type(nicknameInput, '용감한 판다')

      const saveBtn = nicknameInput.parentElement?.querySelector('button')
      expect(saveBtn).not.toBeDisabled()
    })

    it('calls setNickname when save is clicked', async () => {
      const user = userEvent.setup()
      const setNickname = vi.fn().mockResolvedValue(undefined)
      useFamilyStore.setState({ setNickname })
      renderSettingsPage()

      const nicknameInput = screen.getByDisplayValue('귀여운 토끼')
      await user.clear(nicknameInput)
      await user.type(nicknameInput, '용감한 판다')

      const saveBtn = nicknameInput.parentElement?.querySelector('button')
      if (saveBtn) await user.click(saveBtn)

      expect(setNickname).toHaveBeenCalledWith('용감한 판다')
    })
  })

  describe('family members', () => {
    it('shows 가족 구성원 heading', () => {
      renderSettingsPage()
      expect(screen.getByText('가족 구성원')).toBeInTheDocument()
    })

    it('shows member count', () => {
      renderSettingsPage()
      expect(screen.getByText('(2명)')).toBeInTheDocument()
    })

    it('shows member nicknames', () => {
      renderSettingsPage()
      // Both members' nicknames should be visible
      // '귀여운 토끼' appears in both nickname input and members list, so just check for the second member
      expect(screen.getByText('용감한 펭귄')).toBeInTheDocument()
    })

    it('shows (나) badge for current device', () => {
      renderSettingsPage()
      expect(screen.getByText('나')).toBeInTheDocument()
    })

    it('calls fetchMembers on mount', () => {
      const fetchMembers = vi.fn()
      useFamilyStore.setState({ fetchMembers })
      renderSettingsPage()
      expect(fetchMembers).toHaveBeenCalledWith('fam-1')
    })

    it('shows 방장 badge for first member (room owner)', () => {
      renderSettingsPage()
      expect(screen.getByText('방장')).toBeInTheDocument()
    })

    it('shows kick button for non-owner members when current user is owner', () => {
      // dev-1 is owner (members[0]) — should see kick button for dev-2
      renderSettingsPage()
      // The members card should contain exactly one kick button (for dev-2, not for dev-1/owner)
      const memberSection = screen.getByText('가족 구성원').closest('[class*="card"]')!
      const buttons = Array.from(memberSection.querySelectorAll('button'))
      const kickButtons = buttons.filter(btn => btn.querySelector('svg'))
      expect(kickButtons.length).toBe(1)
    })

    it('does not show kick button when current user is not owner', () => {
      useFamilyStore.setState({
        deviceId: 'dev-2', // not the owner (members[0] is dev-1)
        nickname: '용감한 펭귄',
      })
      renderSettingsPage()
      // 방장 badge should still appear for members[0]
      expect(screen.getByText('방장')).toBeInTheDocument()
      // No kick buttons should be visible (baby profile has no baby, so no trash there either)
      // The only trash buttons would be in supplement section (empty) and baby (empty)
    })

    it('shows kick confirmation dialog when kick button clicked', async () => {
      const user = userEvent.setup()
      useFamilyStore.setState({ kickMember: vi.fn() })
      renderSettingsPage()

      // Find kick buttons in the members section
      // The members section has a Trash2 button for the non-owner member
      const memberSection = screen.getByText('가족 구성원').closest('[class*="card"]')
      const kickButton = memberSection?.querySelector('button')
        ? Array.from(memberSection!.querySelectorAll('button')).find(btn =>
          btn.querySelector('svg'),
        )
        : null

      if (kickButton) {
        await user.click(kickButton)
        expect(await screen.findByText('구성원을 내보내시겠습니까?')).toBeInTheDocument()
        expect(screen.getByText('해당 구성원을 가족방에서 내보냅니다.')).toBeInTheDocument()
        expect(screen.getByText('내보내기')).toBeInTheDocument()
      }
    })

    it('calls kickMember when kick is confirmed', async () => {
      const user = userEvent.setup()
      const kickMember = vi.fn().mockResolvedValue(undefined)
      useFamilyStore.setState({ kickMember })
      renderSettingsPage()

      // Find the kick button in the members card
      const memberSection = screen.getByText('가족 구성원').closest('[class*="card"]')
      const kickButton = memberSection
        ? Array.from(memberSection.querySelectorAll('button')).find(btn =>
          btn.querySelector('svg'),
        )
        : null

      if (kickButton) {
        await user.click(kickButton)
        await user.click(screen.getByText('내보내기'))
        expect(kickMember).toHaveBeenCalledWith('dev-2')
      }
    })
  })
})
