import { Outlet } from 'react-router-dom'
import BottomNav from '@/components/layout/BottomNav'

const AppShell = () => {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 pb-20 pt-2">
      <Outlet />
      <BottomNav />
    </div>
  )
}

export default AppShell
