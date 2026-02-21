import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import JoinPage from './JoinPage'
import { useFamilyStore } from '@/stores/familyStore'
import { resetAllStores } from '@/test/helpers/zustandTestUtils'
import { renderWithRouter } from '@/test/helpers/renderWithRouter'

describe('JoinPage', () => {
  beforeEach(() => {
    resetAllStores()
    useFamilyStore.setState({ initialized: true })
  })

  it('renders app name', () => {
    renderWithRouter(
      <Routes>
        <Route path="/join" element={<JoinPage />} />
      </Routes>,
      { initialEntries: ['/join'] },
    )
    expect(screen.getByText('Baby Memo')).toBeInTheDocument()
  })

  it('renders family code input', () => {
    renderWithRouter(
      <Routes>
        <Route path="/join" element={<JoinPage />} />
      </Routes>,
      { initialEntries: ['/join'] },
    )
    expect(screen.getByLabelText('가족 코드')).toBeInTheDocument()
  })

  it('submit button is disabled for short code', () => {
    renderWithRouter(
      <Routes>
        <Route path="/join" element={<JoinPage />} />
      </Routes>,
      { initialEntries: ['/join'] },
    )
    expect(screen.getByText('시작하기')).toBeDisabled()
  })

  it('submit button is enabled for valid code (6+ chars)', async () => {
    const user = userEvent.setup()
    renderWithRouter(
      <Routes>
        <Route path="/join" element={<JoinPage />} />
      </Routes>,
      { initialEntries: ['/join'] },
    )

    await user.type(screen.getByLabelText('가족 코드'), 'BABY01')
    expect(screen.getByText('시작하기')).not.toBeDisabled()
  })

  it('converts input to uppercase', async () => {
    const user = userEvent.setup()
    renderWithRouter(
      <Routes>
        <Route path="/join" element={<JoinPage />} />
      </Routes>,
      { initialEntries: ['/join'] },
    )

    const input = screen.getByLabelText('가족 코드') as HTMLInputElement
    await user.type(input, 'baby01')
    expect(input.value).toBe('BABY01')
  })

  it('filters non-alphanumeric characters', async () => {
    const user = userEvent.setup()
    renderWithRouter(
      <Routes>
        <Route path="/join" element={<JoinPage />} />
      </Routes>,
      { initialEntries: ['/join'] },
    )

    const input = screen.getByLabelText('가족 코드') as HTMLInputElement
    await user.type(input, 'BA-BY@01')
    expect(input.value).toBe('BABY01')
  })

  it('limits code to MAX_CODE_LENGTH characters', async () => {
    const user = userEvent.setup()
    renderWithRouter(
      <Routes>
        <Route path="/join" element={<JoinPage />} />
      </Routes>,
      { initialEntries: ['/join'] },
    )

    const input = screen.getByLabelText('가족 코드') as HTMLInputElement
    await user.type(input, 'ABCDEFGHI')
    expect(input.value).toHaveLength(8)
  })

  it('shows password form when family exists', async () => {
    const user = userEvent.setup()
    useFamilyStore.setState({
      checkFamilyExists: vi.fn().mockResolvedValue(true),
    })

    renderWithRouter(
      <Routes>
        <Route path="/join" element={<JoinPage />} />
      </Routes>,
      { initialEntries: ['/join'] },
    )

    await user.type(screen.getByLabelText('가족 코드'), 'EXIST1')
    await user.click(screen.getByText('시작하기'))

    expect(await screen.findByText('기존 가족방에 참여합니다')).toBeInTheDocument()
    expect(screen.getByLabelText('방 비밀번호')).toBeInTheDocument()
  })

  it('password input accepts only 4 digits', async () => {
    const user = userEvent.setup()
    useFamilyStore.setState({
      checkFamilyExists: vi.fn().mockResolvedValue(true),
    })

    renderWithRouter(
      <Routes>
        <Route path="/join" element={<JoinPage />} />
      </Routes>,
      { initialEntries: ['/join'] },
    )

    await user.type(screen.getByLabelText('가족 코드'), 'EXIST1')
    await user.click(screen.getByText('시작하기'))

    const pwInput = await screen.findByLabelText('방 비밀번호') as HTMLInputElement
    await user.type(pwInput, '12345abc')
    expect(pwInput.value).toBe('1234')
  })

  it('shows back button in password form', async () => {
    const user = userEvent.setup()
    useFamilyStore.setState({
      checkFamilyExists: vi.fn().mockResolvedValue(true),
    })

    renderWithRouter(
      <Routes>
        <Route path="/join" element={<JoinPage />} />
      </Routes>,
      { initialEntries: ['/join'] },
    )

    await user.type(screen.getByLabelText('가족 코드'), 'EXIST1')
    await user.click(screen.getByText('시작하기'))

    expect(await screen.findByText('뒤로가기')).toBeInTheDocument()
  })

  it('goes back to code form when back button clicked', async () => {
    const user = userEvent.setup()
    useFamilyStore.setState({
      checkFamilyExists: vi.fn().mockResolvedValue(true),
    })

    renderWithRouter(
      <Routes>
        <Route path="/join" element={<JoinPage />} />
      </Routes>,
      { initialEntries: ['/join'] },
    )

    await user.type(screen.getByLabelText('가족 코드'), 'EXIST1')
    await user.click(screen.getByText('시작하기'))

    await user.click(await screen.findByText('뒤로가기'))
    expect(screen.getByLabelText('가족 코드')).toBeInTheDocument()
  })

  it('shows error message on join failure', async () => {
    const user = userEvent.setup()
    useFamilyStore.setState({
      checkFamilyExists: vi.fn().mockRejectedValue(new Error('네트워크 오류')),
    })

    renderWithRouter(
      <Routes>
        <Route path="/join" element={<JoinPage />} />
      </Routes>,
      { initialEntries: ['/join'] },
    )

    await user.type(screen.getByLabelText('가족 코드'), 'BABY01')
    await user.click(screen.getByText('시작하기'))

    expect(await screen.findByText('네트워크 오류')).toBeInTheDocument()
  })

  it('does not render join form when already in a family', () => {
    useFamilyStore.setState({ familyId: 'fam-1', initialized: true })
    renderWithRouter(
      <Routes>
        <Route path="/join" element={<JoinPage />} />
        <Route path="/" element={<div>Home Page</div>} />
      </Routes>,
      { initialEntries: ['/join'] },
    )
    // When already authenticated, JoinPage navigates away and returns null
    expect(screen.queryByText('Baby Memo')).not.toBeInTheDocument()
  })
})
