import { useMemo } from 'react'
import { useActivityStore } from '@/stores/activityStore'
import DateNavigator from '@/components/activity/DateNavigator'
import ActivityCard from '@/components/activity/ActivityCard'
import type { Activity } from '@/types/database'

interface TimeGroup {
  label: string
  activities: Activity[]
}

function groupByTimeOfDay(activities: Activity[]): TimeGroup[] {
  const morning: Activity[] = []
  const afternoon: Activity[] = []
  const evening: Activity[] = []

  for (const activity of activities) {
    const hour = new Date(activity.recorded_at).getHours()
    if (hour >= 6 && hour < 12) {
      morning.push(activity)
    } else if (hour >= 12 && hour < 18) {
      afternoon.push(activity)
    } else {
      evening.push(activity)
    }
  }

  const groups: TimeGroup[] = []
  if (morning.length > 0) groups.push({ label: '오전', activities: morning })
  if (afternoon.length > 0) groups.push({ label: '오후', activities: afternoon })
  if (evening.length > 0) groups.push({ label: '저녁/밤', activities: evening })

  return groups
}

const TimelinePage = () => {
  const activities = useActivityStore((s) => s.activities)
  const selectedDate = useActivityStore((s) => s.selectedDate)
  const setSelectedDate = useActivityStore((s) => s.setSelectedDate)
  const loading = useActivityStore((s) => s.loading)

  const groups = useMemo(
    () => groupByTimeOfDay(activities),
    [activities],
  )

  return (
    <div className="flex flex-col gap-3 py-4">
      <DateNavigator date={selectedDate} onDateChange={setSelectedDate} />

      {loading ? (
        <div className="flex flex-col gap-3 py-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[72px] animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
          <p className="text-sm text-muted-foreground">
            이 날짜에 기록된 활동이 없습니다
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {groups.map((group) => (
            <div key={group.label}>
              <div className="mb-2 flex items-center gap-2">
                <h3 className="text-xs font-semibold text-muted-foreground">
                  {group.label}
                </h3>
                <span className="text-xs text-muted-foreground/60">
                  {group.activities.length}건
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {group.activities.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TimelinePage
