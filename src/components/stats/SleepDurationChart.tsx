import { memo, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, PieChart, Pie, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useStatsStore } from '@/stores/statsStore'
import { formatXAxisLabel, extractSleepSessions, ACTIVITY_CHART_COLORS } from '@/lib/statsUtils'
import type { SleepSession } from '@/types/stats'

const SLEEP_COLOR = ACTIVITY_CHART_COLORS.sleep
const EMPTY_COLOR = 'transparent'
const TRACK_COLOR = '#e5e7eb'
const TOTAL_MINUTES = 1440
const TRACK_DATA = [{ value: 1 }]

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

function formatTotalSleep(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0 && mins > 0) return `${hours}시간 ${mins}분`
  if (hours > 0) return `${hours}시간`
  return `${mins}분`
}

function buildPieData(sessions: SleepSession[]) {
  // 수면 구간과 빈 구간을 번갈아 배치
  const sorted = [...sessions].sort((a, b) => a.startMinute - b.startMinute)
  const segments: { value: number; isSleep: boolean; label?: string }[] = []
  let cursor = 0

  for (const s of sorted) {
    if (s.startMinute > cursor) {
      segments.push({ value: s.startMinute - cursor, isSleep: false })
    }
    segments.push({
      value: s.endMinute - s.startMinute,
      isSleep: true,
      label: `${s.startLabel}~${s.endLabel}`,
    })
    cursor = s.endMinute
  }

  if (cursor < TOTAL_MINUTES) {
    segments.push({ value: TOTAL_MINUTES - cursor, isSleep: false })
  }

  return segments
}

const CLOCK_LABELS = [
  { label: '0시', x: '50%', y: 8, textAnchor: 'middle' as const },
  { label: '6시', x: '96%', y: '50%', textAnchor: 'end' as const },
  { label: '12시', x: '50%', y: '97%', textAnchor: 'middle' as const },
  { label: '18시', x: '4%', y: '50%', textAnchor: 'start' as const },
]

const DailyPieChart = memo(({ sessions, totalMinutes }: { sessions: SleepSession[]; totalMinutes: number }) => {
  const pieData = useMemo(() => buildPieData(sessions), [sessions])

  return (
    <div className="relative" style={{ width: '100%', height: 220 }}>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          {/* 배경 트랙 링 */}
          <Pie
            data={TRACK_DATA}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={75}
            fill={TRACK_COLOR}
            stroke="none"
            isAnimationActive={false}
          />
          {/* 수면 구간 */}
          <Pie
            data={pieData}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={75}
            startAngle={90}
            endAngle={-270}
            stroke="none"
          >
            {pieData.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.isSleep ? SLEEP_COLOR : EMPTY_COLOR}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {/* 중앙 텍스트 */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold" data-testid="total-sleep">
          {formatTotalSleep(totalMinutes)}
        </span>
      </div>
      {/* 시계 라벨 */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full">
        {CLOCK_LABELS.map(({ label, x, y, textAnchor }) => (
          <text
            key={label}
            x={x}
            y={y}
            textAnchor={textAnchor}
            dominantBaseline="central"
            className="fill-muted-foreground text-[10px]"
          >
            {label}
          </text>
        ))}
      </svg>
    </div>
  )
})

DailyPieChart.displayName = 'DailyPieChart'

const SleepDurationChart = memo(() => {
  const sleepDurations = useStatsStore((s) => s.sleepDurations)
  const rawActivities = useStatsStore((s) => s.rawActivities)
  const period = useStatsStore((s) => s.period)
  const dateRange = useStatsStore((s) => s.dateRange)

  const chartData = useMemo(() => sleepDurations.map((d) => ({
    date: formatXAxisLabel(d.date, period),
    hours: Math.round((d.minutes / 60) * 10) / 10,
  })), [sleepDurations, period])

  const sessions = useMemo(
    () => (period === 'daily' ? extractSleepSessions(rawActivities, dateRange) : []),
    [period, rawActivities, dateRange],
  )

  const totalMinutes = useMemo(
    () => (period === 'daily'
      ? sessions.reduce((sum, s) => sum + (s.endMinute - s.startMinute), 0)
      : sleepDurations.reduce((sum, d) => sum + d.minutes, 0)
    ),
    [period, sessions, sleepDurations],
  )

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
        {period === 'daily' ? (
          <DailyPieChart sessions={sessions} totalMinutes={totalMinutes} />
        ) : (
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
                fill={SLEEP_COLOR}
                radius={[2, 2, 0, 0]}
              >
                <LabelList
                  dataKey="hours"
                  position="top"
                  formatter={formatSleepLabel}
                  style={{ fontSize: 10, fill: SLEEP_COLOR }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
})

SleepDurationChart.displayName = 'SleepDurationChart'

export default SleepDurationChart
