import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useStatsStore } from '@/stores/statsStore'
import { DRINK_CHART_COLORS, formatXAxisLabel } from '@/lib/statsUtils'
import { DRINK_TYPE_LABELS } from '@/lib/activityConfig'
import type { DrinkType } from '@/types/database'

const DRINK_TYPES: DrinkType[] = ['formula', 'milk', 'water']

const DrinkIntakeChart = () => {
  const drinkIntakes = useStatsStore((s) => s.drinkIntakes)
  const period = useStatsStore((s) => s.period)

  const chartData = drinkIntakes.map((d) => ({
    date: formatXAxisLabel(d.date, period),
    ...d.intakes,
  }))

  const hasData = drinkIntakes.some((d) => d.total > 0)

  if (!hasData) {
    return (
      <Card className="py-4">
        <CardHeader className="px-4 py-0">
          <CardTitle className="text-sm">음료 섭취량 (ml)</CardTitle>
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
        <CardTitle className="text-sm">음료 섭취량 (ml)</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} width={30} />
            <Tooltip />
            <Legend
              iconSize={10}
              wrapperStyle={{ fontSize: 11 }}
            />
            {DRINK_TYPES.map((type) => (
              <Bar
                key={type}
                dataKey={type}
                name={DRINK_TYPE_LABELS[type]}
                stackId="a"
                fill={DRINK_CHART_COLORS[type]}
                stroke={type === 'milk' ? '#d1d5db' : undefined}
                strokeWidth={type === 'milk' ? 1 : 0}
                radius={type === 'water' ? [2, 2, 0, 0] : undefined}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default DrinkIntakeChart
