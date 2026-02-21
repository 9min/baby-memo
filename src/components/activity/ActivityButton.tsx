import { memo } from 'react'
import { cn } from '@/lib/utils'
import type { ActivityConfig } from '@/lib/activityConfig'

interface ActivityButtonProps {
  config: ActivityConfig
  onClick: () => void
}

const ActivityButton = memo(({ config, onClick }: ActivityButtonProps) => {
  const Icon = config.icon

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex min-h-[100px] cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl p-5',
        'shadow-sm transition-all duration-200',
        'hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97] active:shadow-sm',
        config.bgColor,
        config.textColor,
      )}
    >
      <Icon className="h-8 w-8" strokeWidth={1.8} />
      <span className="text-sm font-bold">{config.label}</span>
    </button>
  )
})

ActivityButton.displayName = 'ActivityButton'

export default ActivityButton
