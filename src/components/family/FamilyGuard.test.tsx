import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import FamilyGuard from './FamilyGuard'
import { useFamilyStore } from '@/stores/familyStore'
import { resetAllStores } from '@/test/helpers/zustandTestUtils'
import { renderWithRouter } from '@/test/helpers/renderWithRouter'

describe('FamilyGuard', () => {
  beforeEach(() => {
    resetAllStores()
  })

  it('shows loading text while not initialized', () => {
    useFamilyStore.setState({ initialized: false })
    renderWithRouter(
      <Routes>
        <Route element={<FamilyGuard />}>
          <Route path="/" element={<div>Home</div>} />
        </Route>
      </Routes>,
    )
    expect(screen.getByText('로딩 중...')).toBeInTheDocument()
  })

  it('redirects to /join when initialized but no familyId', () => {
    useFamilyStore.setState({ initialized: true, familyId: null })
    renderWithRouter(
      <Routes>
        <Route element={<FamilyGuard />}>
          <Route path="/" element={<div>Home</div>} />
        </Route>
        <Route path="/join" element={<div>Join Page</div>} />
      </Routes>,
    )
    expect(screen.getByText('Join Page')).toBeInTheDocument()
  })

  it('renders children when authenticated', () => {
    useFamilyStore.setState({ initialized: true, familyId: 'fam-1' })
    renderWithRouter(
      <Routes>
        <Route element={<FamilyGuard />}>
          <Route path="/" element={<div>Home Content</div>} />
        </Route>
      </Routes>,
    )
    expect(screen.getByText('Home Content')).toBeInTheDocument()
  })
})
