import { useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import { useActivityStore } from '@/stores/activityStore'
import { useFamilyStore } from '@/stores/familyStore'
import { groupByTimeOfDay } from '@/lib/timeGrouping'
import DateNavigator from '@/components/activity/DateNavigator'
import ActivityCard from '@/components/activity/ActivityCard'
import SolidFoodSheet from '@/components/activity/SolidFoodSheet'
import DrinkSheet from '@/components/activity/DrinkSheet'
import SupplementSheet from '@/components/activity/SupplementSheet'
import DiaperSheet from '@/components/activity/DiaperSheet'
import SleepSheet from '@/components/activity/SleepSheet'
import type {
  Activity,
  ActivityType,
  ActivityMetadata,
  SolidFoodMetadata,
  DrinkMetadata,
  SupplementMetadata,
  DiaperMetadata,
  SleepMetadata,
} from '@/types/database'

const TimelinePage = () => {
  const familyId = useFamilyStore((s) => s.familyId)
  const deviceId = useFamilyStore((s) => s.deviceId)
  const activities = useActivityStore((s) => s.activities)
  const selectedDate = useActivityStore((s) => s.selectedDate)
  const setSelectedDate = useActivityStore((s) => s.setSelectedDate)
  const loading = useActivityStore((s) => s.loading)
  const updateActivity = useActivityStore((s) => s.updateActivity)
  const recordActivity = useActivityStore((s) => s.recordActivity)

  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [solidFoodOpen, setSolidFoodOpen] = useState(false)
  const [drinkOpen, setDrinkOpen] = useState(false)
  const [supplementOpen, setSupplementOpen] = useState(false)
  const [diaperOpen, setDiaperOpen] = useState(false)
  const [sleepOpen, setSleepOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const groups = useMemo(
    () => groupByTimeOfDay(activities),
    [activities],
  )

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 2000)
  }

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity)
    switch (activity.type) {
      case 'solid_food':
        setSolidFoodOpen(true)
        break
      case 'drink':
        setDrinkOpen(true)
        break
      case 'supplement':
        setSupplementOpen(true)
        break
      case 'diaper':
        setDiaperOpen(true)
        break
      case 'sleep':
        setSleepOpen(true)
        break
    }
  }

  const handleSubmit = (type: ActivityType, metadata: ActivityMetadata, recordedAt: Date, toastMsg: string) => {
    if (editingActivity) {
      updateActivity({
        activityId: editingActivity.id,
        recordedAt: recordedAt.toISOString(),
        metadata,
      })
      showToast(toastMsg)
      setEditingActivity(null)
    } else {
      if (!familyId) return
      recordActivity({
        familyId,
        deviceId,
        type,
        recordedAt: recordedAt.toISOString(),
        metadata,
      })
      showToast(toastMsg)
    }
  }

  const solidFoodInitial = editingActivity?.type === 'solid_food'
    ? { metadata: editingActivity.metadata as SolidFoodMetadata, recordedAt: new Date(editingActivity.recorded_at) }
    : undefined

  const drinkInitial = editingActivity?.type === 'drink'
    ? { metadata: editingActivity.metadata as DrinkMetadata, recordedAt: new Date(editingActivity.recorded_at) }
    : undefined

  const supplementInitial = editingActivity?.type === 'supplement'
    ? { metadata: editingActivity.metadata as SupplementMetadata, recordedAt: new Date(editingActivity.recorded_at) }
    : undefined

  const diaperInitial = editingActivity?.type === 'diaper'
    ? { metadata: editingActivity.metadata as DiaperMetadata, recordedAt: new Date(editingActivity.recorded_at) }
    : undefined

  const sleepInitial = editingActivity?.type === 'sleep'
    ? { metadata: editingActivity.metadata as SleepMetadata, recordedAt: new Date(editingActivity.recorded_at) }
    : undefined

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
                  <ActivityCard key={activity.id} activity={activity} onEdit={handleEdit} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Sheets */}
      <SolidFoodSheet
        open={solidFoodOpen}
        onOpenChange={(open) => { setSolidFoodOpen(open); if (!open) setEditingActivity(null) }}
        onSubmit={(metadata, recordedAt) => handleSubmit('solid_food', metadata, recordedAt, '수정 완료')}
        initialData={solidFoodInitial}
      />
      <DrinkSheet
        open={drinkOpen}
        onOpenChange={(open) => { setDrinkOpen(open); if (!open) setEditingActivity(null) }}
        onSubmit={(metadata, recordedAt) => handleSubmit('drink', metadata, recordedAt, '수정 완료')}
        initialData={drinkInitial}
      />
      <SupplementSheet
        open={supplementOpen}
        onOpenChange={(open) => { setSupplementOpen(open); if (!open) setEditingActivity(null) }}
        onSubmit={(metadata, recordedAt) => handleSubmit('supplement', metadata, recordedAt, '수정 완료')}
        initialData={supplementInitial}
      />
      <DiaperSheet
        open={diaperOpen}
        onOpenChange={(open) => { setDiaperOpen(open); if (!open) setEditingActivity(null) }}
        onSubmit={(metadata, recordedAt) => handleSubmit('diaper', metadata, recordedAt, '수정 완료')}
        initialData={diaperInitial}
      />
      <SleepSheet
        open={sleepOpen}
        onOpenChange={(open) => { setSleepOpen(open); if (!open) setEditingActivity(null) }}
        onSubmit={(metadata, recordedAt) => handleSubmit('sleep', metadata, recordedAt, '수정 완료')}
        initialData={sleepInitial}
      />

      {/* Success Toast */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background shadow-lg">
            <Check className="h-4 w-4" />
            {toast}
          </div>
        </div>
      )}
    </div>
  )
}

export default TimelinePage
