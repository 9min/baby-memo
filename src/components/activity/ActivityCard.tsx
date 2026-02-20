import { useState } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ACTIVITY_CONFIGS, DRINK_TYPE_LABELS, DIAPER_TYPE_LABELS, DIAPER_AMOUNT_LABELS } from '@/lib/activityConfig'
import { useActivityStore } from '@/stores/activityStore'
import { cn } from '@/lib/utils'
import type { Activity, SolidFoodMetadata, DrinkMetadata, DiaperMetadata, SupplementMetadata } from '@/types/database'

function getActivityDetail(activity: Activity): string {
  switch (activity.type) {
    case 'solid_food': {
      const meta = activity.metadata as SolidFoodMetadata
      const parts = [meta.food_name]
      if (meta.amount) parts.push(meta.amount)
      return parts.join(' · ')
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
  }
}

interface ActivityCardProps {
  activity: Activity
  showDelete?: boolean
}

const ActivityCard = ({ activity, showDelete = true }: ActivityCardProps) => {
  const config = ACTIVITY_CONFIGS[activity.type]
  const Icon = config.icon
  const deleteActivity = useActivityStore((s) => s.deleteActivity)
  const [confirming, setConfirming] = useState(false)

  const timeStr = format(new Date(activity.recorded_at), 'HH:mm', { locale: ko })
  const detail = getActivityDetail(activity)

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true)
      setTimeout(() => setConfirming(false), 3000)
      return
    }
    await deleteActivity(activity.id)
  }

  return (
    <Card className="py-3 transition-colors">
      <CardContent className="flex items-center gap-3 px-4">
        <div className={cn('shrink-0 rounded-full p-2.5', config.bgColor)}>
          <Icon className={cn('h-5 w-5', config.textColor)} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{config.label}</span>
            <Badge variant="secondary" className="text-xs font-normal">
              {detail}
            </Badge>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{timeStr}</span>
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
            onClick={handleDelete}
            aria-label={confirming ? '삭제 확인' : '삭제'}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export default ActivityCard
