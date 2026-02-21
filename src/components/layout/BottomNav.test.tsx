import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BottomNav from './BottomNav'
import { renderWithRouter } from '@/test/helpers/renderWithRouter'

describe('BottomNav', () => {
  it('renders 3 navigation links', () => {
    renderWithRouter(<BottomNav />)
    expect(screen.getByText('홈')).toBeInTheDocument()
    expect(screen.getByText('타임라인')).toBeInTheDocument()
    expect(screen.getByText('설정')).toBeInTheDocument()
  })

  it('home link points to /', () => {
    renderWithRouter(<BottomNav />)
    const homeLink = screen.getByText('홈').closest('a')
    expect(homeLink?.getAttribute('href')).toBe('/')
  })

  it('timeline link points to /timeline', () => {
    renderWithRouter(<BottomNav />)
    const link = screen.getByText('타임라인').closest('a')
    expect(link?.getAttribute('href')).toBe('/timeline')
  })

  it('settings link points to /settings', () => {
    renderWithRouter(<BottomNav />)
    const link = screen.getByText('설정').closest('a')
    expect(link?.getAttribute('href')).toBe('/settings')
  })

  it('highlights active link', async () => {
    const user = userEvent.setup()
    renderWithRouter(<BottomNav />, { initialEntries: ['/'] })

    // Home should be active on /
    const homeLink = screen.getByText('홈').closest('a')
    expect(homeLink?.className).toContain('text-primary')

    // Navigate to timeline
    await user.click(screen.getByText('타임라인'))
    const timelineLink = screen.getByText('타임라인').closest('a')
    expect(timelineLink?.className).toContain('text-primary')
  })
})
