import { cn } from '@/lib/utils'
import type { ActivityConfig } from '@/lib/activityConfig'

interface ActivityButtonProps {
  config: ActivityConfig
  onClick: () => void
}

const ActivityButton = ({ config, onClick }: ActivityButtonProps) => {
  const Icon = config.icon

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex min-h-[100px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl p-5',
        'shadow-sm transition-all duration-200',
        'hover:shadow-md hover:brightness-95 active:scale-[0.97]',
        config.bgColor,
        config.textColor,
      )}
    >
      <Icon className="h-9 w-9" strokeWidth={1.8} />
      <span className="text-base font-semibold">{config.label}</span>
    </button>
  )
}

export default ActivityButton
