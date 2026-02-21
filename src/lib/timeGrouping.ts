import type { Activity } from '@/types/database'

export interface TimeGroup {
  label: string
  activities: Activity[]
}

export function groupByTimeOfDay(activities: Activity[]): TimeGroup[] {
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
