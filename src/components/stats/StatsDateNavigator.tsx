import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStatsStore } from '@/stores/statsStore'
import { formatPeriodLabel } from '@/lib/statsUtils'

const StatsDateNavigator = () => {
  const dateRange = useStatsStore((s) => s.dateRange)
  const period = useStatsStore((s) => s.period)
  const navigatePrev = useStatsStore((s) => s.navigatePrev)
  const navigateNext = useStatsStore((s) => s.navigateNext)
  const goToToday = useStatsStore((s) => s.goToToday)

  return (
    <div className="flex items-center justify-between">
      <Button variant="ghost" size="icon" onClick={navigatePrev}>
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <button
        onClick={goToToday}
        className="text-sm font-medium hover:text-primary transition-colors"
      >
        {formatPeriodLabel(period, dateRange)}
      </button>
      <Button variant="ghost" size="icon" onClick={navigateNext}>
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  )
}

export default StatsDateNavigator
