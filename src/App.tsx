import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useFamily } from '@/hooks/useFamily'
import { useActivitySubscription } from '@/hooks/useActivitySubscription'
import { useTheme } from '@/hooks/useTheme'
import FamilyGuard from '@/components/family/FamilyGuard'
import AppShell from '@/components/layout/AppShell'
import JoinPage from '@/pages/JoinPage'
import HomePage from '@/pages/HomePage'
import TimelinePage from '@/pages/TimelinePage'
import SettingsPage from '@/pages/SettingsPage'
import StatsPage from '@/pages/StatsPage'

const ScrollToTop = () => {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

const AppRoutes = () => {
  useFamily()
  useActivitySubscription()
  useTheme()

  return (
    <Routes>
      <Route path="/join" element={<JoinPage />} />
      <Route element={<FamilyGuard />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
