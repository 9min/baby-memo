import { Outlet } from 'react-router-dom'
import { Eye } from 'lucide-react'
import BottomNav from '@/components/layout/BottomNav'
import { useDemoStore } from '@/stores/demoStore'

const AppShell = () => {
  const isDemo = useDemoStore((s) => s.isDemo)

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 pb-20 pt-2">
      <Outlet />
      {isDemo && (
        <div className="fixed bottom-[4.5rem] left-0 right-0 z-40 flex justify-center pointer-events-none">
          <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 shadow-sm dark:bg-amber-900/80 dark:text-amber-300">
            <Eye className="h-3 w-3" />
            체험 모드
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  )
}

export default AppShell
