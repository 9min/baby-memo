import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import AppShell from './AppShell'
import { renderWithRouter } from '@/test/helpers/renderWithRouter'

describe('AppShell', () => {
  it('renders Outlet content', () => {
    renderWithRouter(
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<div>Page Content</div>} />
        </Route>
      </Routes>,
    )
    expect(screen.getByText('Page Content')).toBeInTheDocument()
  })

  it('renders BottomNav', () => {
    renderWithRouter(
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<div>Page Content</div>} />
        </Route>
      </Routes>,
    )
    expect(screen.getByText('홈')).toBeInTheDocument()
    expect(screen.getByText('타임라인')).toBeInTheDocument()
    expect(screen.getByText('설정')).toBeInTheDocument()
  })
})
