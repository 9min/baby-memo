import { Outlet } from 'react-router-dom'
import BottomNav from '@/components/layout/BottomNav'

const AppShell = () => {
  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 pb-20">
      <Outlet />
      <BottomNav />
    </div>
  )
}

export default AppShell
