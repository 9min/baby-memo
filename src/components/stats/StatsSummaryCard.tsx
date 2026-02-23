import { memo, useMemo } from 'react'
import { ClipboardList, GlassWater, Moon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useStatsStore } from '@/stores/statsStore'
import type { LucideIcon } from 'lucide-react'

interface SummaryItem {
  label: string
  value: string
  icon: LucideIcon
  bgColor: string
  textColor: string
}

const StatsSummaryCard = memo(() => {
  const activityCounts = useStatsStore((s) => s.activityCounts)
  const drinkIntakes = useStatsStore((s) => s.drinkIntakes)
  const sleepDurations = useStatsStore((s) => s.sleepDurations)

  const totalActivities = useMemo(() => activityCounts.reduce((sum, d) => sum + d.total, 0), [activityCounts])
  const totalDrinkMl = useMemo(() => drinkIntakes.reduce((sum, d) => sum + d.total, 0), [drinkIntakes])
  const totalSleepMin = useMemo(() => sleepDurations.reduce((sum, d) => sum + d.minutes, 0), [sleepDurations])
  const sleepHours = Math.floor(totalSleepMin / 60)
  const sleepMins = totalSleepMin % 60

  const items: SummaryItem[] = [
    {
      label: '전체 기록',
      value: `${totalActivities}건`,
      icon: ClipboardList,
      bgColor: 'bg-primary/10',
      textColor: 'text-primary',
    },
    {
      label: '수분 섭취',
      value: `${totalDrinkMl}ml`,
      icon: GlassWater,
      bgColor: 'bg-sky-50 dark:bg-sky-950/40',
      textColor: 'text-sky-600 dark:text-sky-400',
    },
    {
      label: '수면',
      value: sleepHours > 0 ? `${sleepHours}h ${sleepMins}m` : `${sleepMins}m`,
      icon: Moon,
      bgColor: 'bg-slate-100 dark:bg-slate-900/40',
      textColor: 'text-slate-600 dark:text-slate-400',
    },
  ]

  return (
    <Card className="py-4">
      <CardContent className="px-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="flex flex-col items-center gap-1">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.bgColor}`}>
                  <Icon className={`h-4 w-4 ${item.textColor}`} />
                </div>
                <p className="text-lg font-bold">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
})

StatsSummaryCard.displayName = 'StatsSummaryCard'

export default StatsSummaryCard
