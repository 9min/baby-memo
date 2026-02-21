import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useStatsStore } from '@/stores/statsStore'
import { ACTIVITY_CHART_COLORS, formatXAxisLabel } from '@/lib/statsUtils'
import { ACTIVITY_CONFIGS } from '@/lib/activityConfig'
import type { ActivityType } from '@/types/database'

const ACTIVITY_TYPES: ActivityType[] = ['solid_food', 'drink', 'supplement', 'diaper', 'sleep']

const ActivityCountChart = () => {
  const activityCounts = useStatsStore((s) => s.activityCounts)
  const period = useStatsStore((s) => s.period)

  const chartData = activityCounts.map((d) => ({
    date: formatXAxisLabel(d.date, period),
    ...d.counts,
  }))

  const hasData = activityCounts.some((d) => d.total > 0)

  if (!hasData) {
    return (
      <Card className="py-4">
        <CardHeader className="px-4 py-0">
          <CardTitle className="text-sm">활동 횟수</CardTitle>
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
        <CardTitle className="text-sm">활동 횟수</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={24} />
            <Tooltip />
            <Legend
              iconSize={10}
              wrapperStyle={{ fontSize: 11 }}
            />
            {ACTIVITY_TYPES.map((type) => (
              <Bar
                key={type}
                dataKey={type}
                name={ACTIVITY_CONFIGS[type].label}
                stackId="a"
                fill={ACTIVITY_CHART_COLORS[type]}
                radius={type === 'sleep' ? [2, 2, 0, 0] : undefined}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default ActivityCountChart
