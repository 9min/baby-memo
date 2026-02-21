import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'
import { useFamilyStore } from '@/stores/familyStore'

// Mock hooks to prevent side effects
vi.mock('@/hooks/useFamily', () => ({
  useFamily: vi.fn(),
}))

vi.mock('@/hooks/useActivitySubscription', () => ({
  useActivitySubscription: vi.fn(),
}))

// Mock recharts to prevent jsdom issues
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
}))

describe('App', () => {
  beforeEach(() => {
    useFamilyStore.setState({
      familyId: null,
      familyCode: null,
      familyPassword: null,
      deviceId: 'test-device',
      initialized: true,
    })
  })

  it('renders without crashing', () => {
    render(<App />)
    // When not in a family, should show JoinPage content
    expect(document.body).toBeTruthy()
  })

  it('renders JoinPage when not in a family', () => {
    render(<App />)
    expect(screen.getByText('Baby Memo')).toBeInTheDocument()
  })

  it('renders home page when in a family', () => {
    useFamilyStore.setState({
      familyId: 'fam-1',
      familyCode: 'TESTFAM',
      familyPassword: '1234',
      initialized: true,
    })
    render(<App />)
    // FamilyGuard should pass and show the home page content
    // The home page should be rendered within AppShell
    expect(screen.queryByText('Baby Memo')).not.toBeInTheDocument()
  })
})
