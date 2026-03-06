import type { Activity, SleepMetadata } from '@/types/database'

export interface TimeGroup {
  label: string
  activities: Activity[]
}

function isSameDate(a: string, b: string): boolean {
  const da = new Date(a)
  const db = new Date(b)
  return da.getFullYear() === db.getFullYear()
    && da.getMonth() === db.getMonth()
    && da.getDate() === db.getDate()
}

function getGroupingHour(activity: Activity): number {
  if (activity.type === 'sleep') {
    const endTime = (activity.metadata as SleepMetadata).end_time
    if (endTime && isSameDate(activity.recorded_at, endTime)) {
      return new Date(endTime).getHours()
    }
  }
  return new Date(activity.recorded_at).getHours()
}

export function groupByTimeOfDay(activities: Activity[]): TimeGroup[] {
  const morning: Activity[] = []
  const afternoon: Activity[] = []
  const evening: Activity[] = []

  for (const activity of activities) {
    const hour = getGroupingHour(activity)
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
