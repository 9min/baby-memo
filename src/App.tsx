import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { lazy, Suspense, useLayoutEffect } from 'react'
import { useFamily } from '@/hooks/useFamily'
import { useActivitySubscription } from '@/hooks/useActivitySubscription'
import { useTheme } from '@/hooks/useTheme'
import FamilyGuard from '@/components/family/FamilyGuard'
import AppShell from '@/components/layout/AppShell'
import JoinPage from '@/pages/JoinPage'

const HomePage = lazy(() => import('@/pages/HomePage'))
const TimelinePage = lazy(() => import('@/pages/TimelinePage'))
const StatsPage = lazy(() => import('@/pages/StatsPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))

const ScrollToTop = () => {
  const { pathname } = useLocation()
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0 })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [pathname])
  return null
}

const AppRoutes = () => {
  useFamily()
  useActivitySubscription()
  useTheme()

  return (
    <Suspense fallback={null}>
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
    </Suspense>
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
