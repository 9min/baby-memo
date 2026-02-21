import { useEffect } from 'react'
import { useFamilyStore } from '@/stores/familyStore'
import { useStatsStore } from '@/stores/statsStore'
import PeriodTabs from '@/components/stats/PeriodTabs'
import StatsDateNavigator from '@/components/stats/StatsDateNavigator'
import StatsSummaryCard from '@/components/stats/StatsSummaryCard'
import ActivityCountChart from '@/components/stats/ActivityCountChart'
import DrinkIntakeChart from '@/components/stats/DrinkIntakeChart'
import SleepDurationChart from '@/components/stats/SleepDurationChart'
import { Loader2 } from 'lucide-react'

const StatsPage = () => {
  const familyId = useFamilyStore((s) => s.familyId)
  const dateRange = useStatsStore((s) => s.dateRange)
  const loading = useStatsStore((s) => s.loading)
  const fetchStats = useStatsStore((s) => s.fetchStats)

  useEffect(() => {
    if (familyId) {
      fetchStats(familyId)
    }
  }, [familyId, dateRange, fetchStats])

  return (
    <div className="flex flex-col gap-4 p-4">
      <PeriodTabs />
      <StatsDateNavigator />
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <StatsSummaryCard />
          <ActivityCountChart />
          <DrinkIntakeChart />
          <SleepDurationChart />
        </>
      )}
    </div>
  )
}

export default StatsPage
