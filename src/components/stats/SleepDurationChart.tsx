import { memo, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useStatsStore } from '@/stores/statsStore'
import { formatXAxisLabel } from '@/lib/statsUtils'

const formatSleepLabel = (value: string | number | boolean | null | undefined) => {
  const n = Number(value ?? 0)
  return n > 0 ? `${n}h` : ''
}

const formatSleepTooltip = (value: number | undefined) => {
  const v = value ?? 0
  const hours = Math.floor(v)
  const mins = Math.round((v - hours) * 60)
  if (hours > 0 && mins > 0) return [`${hours}시간 ${mins}분`, '수면']
  if (hours > 0) return [`${hours}시간`, '수면']
  return [`${mins}분`, '수면']
}

const SleepDurationChart = memo(() => {
  const sleepDurations = useStatsStore((s) => s.sleepDurations)
  const period = useStatsStore((s) => s.period)

  const chartData = useMemo(() => sleepDurations.map((d) => ({
    date: formatXAxisLabel(d.date, period),
    hours: Math.round((d.minutes / 60) * 10) / 10,
  })), [sleepDurations, period])

  const hasData = sleepDurations.some((d) => d.minutes > 0)

  if (!hasData) {
    return (
      <Card className="py-4">
        <CardHeader className="px-4 py-0">
          <CardTitle className="text-sm">수면 시간</CardTitle>
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
        <CardTitle className="text-sm">수면 시간</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} width={24} />
            <Tooltip
              formatter={formatSleepTooltip}
            />
            <Bar
              dataKey="hours"
              name="수면"
              fill="#6366f1"
              radius={[2, 2, 0, 0]}
            >
              <LabelList
                dataKey="hours"
                position="top"
                formatter={formatSleepLabel}
                style={{ fontSize: 10, fill: '#6366f1' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
})

SleepDurationChart.displayName = 'SleepDurationChart'

export default SleepDurationChart
