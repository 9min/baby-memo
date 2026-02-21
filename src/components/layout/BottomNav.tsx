import { NavLink } from 'react-router-dom'
import { Home, CalendarDays, BarChart3, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { to: '/', label: '홈', icon: Home },
  { to: '/timeline', label: '타임라인', icon: CalendarDays },
  { to: '/stats', label: '통계', icon: BarChart3 },
  { to: '/settings', label: '설정', icon: Settings },
]

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-xl px-4 py-1.5 text-xs transition-colors',
                isActive
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground active:text-foreground',
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn('h-5 w-5', isActive && 'stroke-[2.5]')}
                />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav
