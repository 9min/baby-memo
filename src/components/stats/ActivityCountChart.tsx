import { memo, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useStatsStore } from '@/stores/statsStore'
import { ACTIVITY_CONFIGS } from '@/lib/activityConfig'
import type { ActivityType } from '@/types/database'

const ACTIVITY_TYPES: ActivityType[] = ['solid_food', 'drink', 'supplement', 'diaper', 'sleep']

const ActivityCountChart = memo(() => {
  const activityCounts = useStatsStore((s) => s.activityCounts)

  const typeTotals = useMemo(() => {
    const totals: Partial<Record<ActivityType, number>> = {}
    for (const day of activityCounts) {
      for (const type of ACTIVITY_TYPES) {
        const count = day.counts[type] ?? 0
        if (count > 0) {
          totals[type] = (totals[type] ?? 0) + count
        }
      }
    }
    return totals
  }, [activityCounts])

  const hasData = Object.values(typeTotals).some((v) => (v ?? 0) > 0)

  if (!hasData) {
    return (
      <Card className="py-4">
        <CardHeader className="px-4 py-0">
          <CardTitle className="text-sm">활동 요약</CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            기록이 없습니다
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="py-4">
      <CardHeader className="px-4 py-0">
        <CardTitle className="text-sm">활동 요약</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pt-3">
        <div className="space-y-2">
          {ACTIVITY_TYPES.map((type) => {
            const config = ACTIVITY_CONFIGS[type]
            const Icon = config.icon
            const count = typeTotals[type] ?? 0
            return (
              <div key={type} className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.bgColor}`}>
                  <Icon className={`h-4 w-4 ${config.textColor}`} />
                </div>
                <span className="flex-1 text-sm">{config.label}</span>
                <span className="text-sm font-semibold">{count}회</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
})

ActivityCountChart.displayName = 'ActivityCountChart'

export default ActivityCountChart
