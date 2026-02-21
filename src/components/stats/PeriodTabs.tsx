import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useStatsStore } from '@/stores/statsStore'
import type { StatsPeriod } from '@/types/stats'

const periods: { value: StatsPeriod; label: string }[] = [
  { value: 'daily', label: '일별' },
  { value: 'weekly', label: '주별' },
  { value: 'monthly', label: '월별' },
]

const PeriodTabs = () => {
  const period = useStatsStore((s) => s.period)
  const setPeriod = useStatsStore((s) => s.setPeriod)

  return (
    <Tabs value={period} onValueChange={(v) => setPeriod(v as StatsPeriod)}>
      <TabsList className="w-full">
        {periods.map((p) => (
          <TabsTrigger key={p.value} value={p.value} className="flex-1">
            {p.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

export default PeriodTabs
