import { Card, CardContent } from '@/components/ui/card'
import { useStatsStore } from '@/stores/statsStore'

const StatsSummaryCard = () => {
  const activityCounts = useStatsStore((s) => s.activityCounts)
  const drinkIntakes = useStatsStore((s) => s.drinkIntakes)
  const sleepDurations = useStatsStore((s) => s.sleepDurations)

  const totalActivities = activityCounts.reduce((sum, d) => sum + d.total, 0)
  const totalDrinkMl = drinkIntakes.reduce((sum, d) => sum + d.total, 0)
  const totalSleepMin = sleepDurations.reduce((sum, d) => sum + d.minutes, 0)
  const sleepHours = Math.floor(totalSleepMin / 60)
  const sleepMins = totalSleepMin % 60

  const items = [
    { label: '전체 기록', value: `${totalActivities}건` },
    { label: '음료 섭취', value: `${totalDrinkMl}ml` },
    { label: '수면', value: sleepHours > 0 ? `${sleepHours}h ${sleepMins}m` : `${sleepMins}m` },
  ]

  return (
    <Card className="py-4">
      <CardContent className="px-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          {items.map((item) => (
            <div key={item.label}>
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-lg font-bold">{item.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default StatsSummaryCard
