import { supabase } from '@/lib/supabase'
import { ACTIVITY_CONFIGS, DRINK_TYPE_LABELS, DIAPER_TYPE_LABELS, DIAPER_AMOUNT_LABELS } from '@/lib/activityConfig'
import { format } from 'date-fns'
import type {
  Activity,
  SolidFoodMetadata,
  DrinkMetadata,
  DiaperMetadata,
  SupplementMetadata,
  SleepMetadata,
  MemoMetadata,
} from '@/types/database'

const escapeCSV = (value: string): string => {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

const formatDetail = (activity: Activity): string => {
  const meta = activity.metadata
  switch (activity.type) {
    case 'solid_food':
      return (meta as SolidFoodMetadata).food_name || ''
    case 'drink': {
      const d = meta as DrinkMetadata
      return `${DRINK_TYPE_LABELS[d.drink_type]} ${d.amount_ml}ml`
    }
    case 'diaper': {
      const dp = meta as DiaperMetadata
      return `${DIAPER_TYPE_LABELS[dp.diaper_type]} ${DIAPER_AMOUNT_LABELS[dp.amount]}`
    }
    case 'supplement':
      return (meta as SupplementMetadata).supplement_names.join(', ')
    case 'sleep': {
      const s = meta as SleepMetadata
      if (s.end_time) {
        const start = new Date(activity.recorded_at).getTime()
        const end = new Date(s.end_time).getTime()
        const durationMin = Math.round((end - start) / 60000)
        return `${durationMin}분 수면`
      }
      return '취침'
    }
    case 'memo':
      return (meta as MemoMetadata).content || ''
    default:
      return ''
  }
}

export async function exportActivitiesCSV(familyId: string): Promise<void> {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('family_id', familyId)
    .order('recorded_at', { ascending: false })

  if (error) throw new Error('데이터를 불러오는데 실패했습니다.')

  const activities = (data as Activity[]) ?? []

  const header = '날짜,시간,활동유형,상세내용,메모'
  const rows = activities.map((a) => {
    const date = format(new Date(a.recorded_at), 'yyyy-MM-dd')
    const time = format(new Date(a.recorded_at), 'HH:mm')
    const type = ACTIVITY_CONFIGS[a.type].label
    const detail = formatDetail(a)
    const memo = a.memo ?? ''

    return [date, time, type, detail, memo].map(escapeCSV).join(',')
  })

  const csv = '\uFEFF' + [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `baby-memo-활동기록-${format(new Date(), 'yyyy-MM-dd')}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
