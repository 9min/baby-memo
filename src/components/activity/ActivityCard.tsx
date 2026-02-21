import { memo, useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ACTIVITY_CONFIGS, DRINK_TYPE_LABELS, DIAPER_TYPE_LABELS, DIAPER_AMOUNT_LABELS } from '@/lib/activityConfig'
import { useActivityStore } from '@/stores/activityStore'
import { cn } from '@/lib/utils'
import type { Activity, SolidFoodMetadata, DrinkMetadata, DiaperMetadata, SupplementMetadata, SleepMetadata } from '@/types/database'

function getActivityDetail(activity: Activity): string {
  switch (activity.type) {
    case 'solid_food': {
      const meta = activity.metadata as SolidFoodMetadata
      return meta.food_name
    }
    case 'drink': {
      const meta = activity.metadata as DrinkMetadata
      const parts = [DRINK_TYPE_LABELS[meta.drink_type]]
      if (meta.amount_ml > 0) parts.push(`${meta.amount_ml}ml`)
      return parts.join(' · ')
    }
    case 'supplement': {
      const meta = activity.metadata as SupplementMetadata
      return meta.supplement_names.join(', ')
    }
    case 'diaper': {
      const meta = activity.metadata as DiaperMetadata
      return `${DIAPER_TYPE_LABELS[meta.diaper_type]} · ${DIAPER_AMOUNT_LABELS[meta.amount]}`
    }
    case 'sleep': {
      const meta = activity.metadata as SleepMetadata
      const parts: string[] = []
      if (meta.end_time) {
        parts.push(`~ ${format(new Date(meta.end_time), 'HH:mm', { locale: ko })}`)
      }
      if (meta.note) {
        parts.push(meta.note)
      }
      return parts.length > 0 ? parts.join(' · ') : '취침'
    }
  }
}

interface ActivityCardProps {
  activity: Activity
  showDelete?: boolean
  onEdit?: (activity: Activity) => void
  deviceNickname?: string
}

const ActivityCard = memo(({ activity, showDelete = true, onEdit, deviceNickname }: ActivityCardProps) => {
  const config = ACTIVITY_CONFIGS[activity.type]
  const Icon = config.icon
  const deleteActivity = useActivityStore((s) => s.deleteActivity)
  const [confirming, setConfirming] = useState(false)
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
    }
  }, [])

  const timeStr = format(new Date(activity.recorded_at), 'HH:mm', { locale: ko })
  const detail = getActivityDetail(activity)

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true)
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
      confirmTimerRef.current = setTimeout(() => setConfirming(false), 3000)
      return
    }
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
    await deleteActivity(activity.id)
  }

  return (
    <Card
      className={cn(
        'py-3 transition-all duration-200',
        onEdit && 'cursor-pointer hover:shadow-sm active:bg-muted/50',
      )}
      onClick={() => onEdit?.(activity)}
    >
      <CardContent className="flex items-center gap-3 px-4">
        <div className={cn('shrink-0 rounded-xl p-2.5', config.bgColor)}>
          <Icon className={cn('h-5 w-5', config.textColor)} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="shrink-0 font-bold text-sm whitespace-nowrap">{config.label}</span>
            <span className="text-xs text-muted-foreground bg-secondary rounded-md px-2 py-0.5 break-all">
              {detail}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{timeStr}</span>
            {deviceNickname && (
              <>
                <span>·</span>
                <span className="truncate">{deviceNickname}</span>
              </>
            )}
            {activity.memo && (
              <>
                <span>·</span>
                <span className="truncate">{activity.memo}</span>
              </>
            )}
          </div>
        </div>
        {showDelete && (
          <Button
            variant={confirming ? 'destructive' : 'ghost'}
            size="icon"
            className={cn(
              'shrink-0 min-h-[44px] min-w-[44px] cursor-pointer transition-all',
              !confirming && 'text-muted-foreground hover:text-destructive',
            )}
            onClick={(e) => {
              e.stopPropagation()
              handleDelete()
            }}
            aria-label={confirming ? '삭제 확인' : '삭제'}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  )
})

ActivityCard.displayName = 'ActivityCard'

export default ActivityCard
