import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Check, List, CalendarDays } from 'lucide-react'
import { useActivityStore } from '@/stores/activityStore'
import { useFamilyStore } from '@/stores/familyStore'
import { groupByTimeOfDay } from '@/lib/timeGrouping'
import { Button } from '@/components/ui/button'
import DateNavigator from '@/components/activity/DateNavigator'
import MonthlyCalendar from '@/components/activity/MonthlyCalendar'
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

type ViewMode = 'day' | 'month'

const TimelinePage = () => {
  const familyId = useFamilyStore((s) => s.familyId)
  const deviceId = useFamilyStore((s) => s.deviceId)
  const members = useFamilyStore((s) => s.members)
  const activities = useActivityStore((s) => s.activities)
  const selectedDate = useActivityStore((s) => s.selectedDate)
  const setSelectedDate = useActivityStore((s) => s.setSelectedDate)
  const loading = useActivityStore((s) => s.loading)
  const updateActivity = useActivityStore((s) => s.updateActivity)
  const recordActivity = useActivityStore((s) => s.recordActivity)
  const monthlyActivityDates = useActivityStore((s) => s.monthlyActivityDates)
  const fetchMonthlyActivityDates = useActivityStore((s) => s.fetchMonthlyActivityDates)

  const [viewMode, setViewMode] = useState<ViewMode>('day')
  const [currentMonth, setCurrentMonth] = useState(() => new Date())
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)

  useEffect(() => {
    if (viewMode === 'month' && familyId) {
      fetchMonthlyActivityDates(familyId, currentMonth.getFullYear(), currentMonth.getMonth())
    }
  }, [viewMode, familyId, currentMonth, fetchMonthlyActivityDates])

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date)
    setViewMode('day')
  }, [setSelectedDate])

  const [solidFoodOpen, setSolidFoodOpen] = useState(false)
  const [drinkOpen, setDrinkOpen] = useState(false)
  const [supplementOpen, setSupplementOpen] = useState(false)
  const [diaperOpen, setDiaperOpen] = useState(false)
  const [sleepOpen, setSleepOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  const deviceMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const m of members) {
      if (m.nickname) map[m.device_id] = m.nickname
    }
    return map
  }, [members])

  const groups = useMemo(
    () => groupByTimeOfDay(activities),
    [activities],
  )

  const showToast = useCallback((message: string) => {
    setToast(message)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(null), 2000)
  }, [])

  const handleEdit = useCallback((activity: Activity) => {
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
  }, [])

  const handleSubmit = useCallback((type: ActivityType, metadata: ActivityMetadata, recordedAt: Date, toastMsg: string) => {
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
  }, [editingActivity, familyId, deviceId, recordActivity, updateActivity, showToast])

  const solidFoodInitial = useMemo(() => editingActivity?.type === 'solid_food'
    ? { metadata: editingActivity.metadata as SolidFoodMetadata, recordedAt: new Date(editingActivity.recorded_at) }
    : undefined, [editingActivity])

  const drinkInitial = useMemo(() => editingActivity?.type === 'drink'
    ? { metadata: editingActivity.metadata as DrinkMetadata, recordedAt: new Date(editingActivity.recorded_at) }
    : undefined, [editingActivity])

  const supplementInitial = useMemo(() => editingActivity?.type === 'supplement'
    ? { metadata: editingActivity.metadata as SupplementMetadata, recordedAt: new Date(editingActivity.recorded_at) }
    : undefined, [editingActivity])

  const diaperInitial = useMemo(() => editingActivity?.type === 'diaper'
    ? { metadata: editingActivity.metadata as DiaperMetadata, recordedAt: new Date(editingActivity.recorded_at) }
    : undefined, [editingActivity])

  const sleepInitial = useMemo(() => editingActivity?.type === 'sleep'
    ? { metadata: editingActivity.metadata as SleepMetadata, recordedAt: new Date(editingActivity.recorded_at) }
    : undefined, [editingActivity])

  const handleSolidFoodOpenChange = useCallback((open: boolean) => {
    setSolidFoodOpen(open)
    if (!open) setEditingActivity(null)
  }, [])

  const handleDrinkOpenChange = useCallback((open: boolean) => {
    setDrinkOpen(open)
    if (!open) setEditingActivity(null)
  }, [])

  const handleSupplementOpenChange = useCallback((open: boolean) => {
    setSupplementOpen(open)
    if (!open) setEditingActivity(null)
  }, [])

  const handleDiaperOpenChange = useCallback((open: boolean) => {
    setDiaperOpen(open)
    if (!open) setEditingActivity(null)
  }, [])

  const handleSleepOpenChange = useCallback((open: boolean) => {
    setSleepOpen(open)
    if (!open) setEditingActivity(null)
  }, [])

  const handleSolidFoodSubmit = useCallback((metadata: SolidFoodMetadata, recordedAt: Date) => {
    handleSubmit('solid_food', metadata, recordedAt, '수정 완료')
  }, [handleSubmit])

  const handleDrinkSubmit = useCallback((metadata: DrinkMetadata, recordedAt: Date) => {
    handleSubmit('drink', metadata, recordedAt, '수정 완료')
  }, [handleSubmit])

  const handleSupplementSubmit = useCallback((metadata: SupplementMetadata, recordedAt: Date) => {
    handleSubmit('supplement', metadata, recordedAt, '수정 완료')
  }, [handleSubmit])

  const handleDiaperSubmit = useCallback((metadata: DiaperMetadata, recordedAt: Date) => {
    handleSubmit('diaper', metadata, recordedAt, '수정 완료')
  }, [handleSubmit])

  const handleSleepSubmit = useCallback((metadata: SleepMetadata, recordedAt: Date) => {
    handleSubmit('sleep', metadata, recordedAt, '수정 완료')
  }, [handleSubmit])

  return (
    <div className="flex flex-col gap-3 py-4">
      {/* View mode toggle */}
      <div className="flex justify-end gap-1">
        <Button
          variant={viewMode === 'day' ? 'default' : 'ghost'}
          size="icon"
          className="h-8 w-8 cursor-pointer"
          onClick={() => setViewMode('day')}
          aria-label="일별 보기"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'month' ? 'default' : 'ghost'}
          size="icon"
          className="h-8 w-8 cursor-pointer"
          onClick={() => setViewMode('month')}
          aria-label="월별 보기"
        >
          <CalendarDays className="h-4 w-4" />
        </Button>
      </div>

      {viewMode === 'month' ? (
        <MonthlyCalendar
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          onDateSelect={handleDateSelect}
          activityDates={monthlyActivityDates}
        />
      ) : (
        <>
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
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary/20 bg-primary/[0.02] py-16 text-center">
          <p className="text-sm font-medium text-muted-foreground">
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
                  <ActivityCard key={activity.id} activity={activity} onEdit={handleEdit} deviceNickname={activity.device_id ? deviceMap[activity.device_id] : undefined} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
        </>
      )}

      {/* Edit Sheets */}
      <SolidFoodSheet
        open={solidFoodOpen}
        onOpenChange={handleSolidFoodOpenChange}
        onSubmit={handleSolidFoodSubmit}
        initialData={solidFoodInitial}
      />
      <DrinkSheet
        open={drinkOpen}
        onOpenChange={handleDrinkOpenChange}
        onSubmit={handleDrinkSubmit}
        initialData={drinkInitial}
      />
      <SupplementSheet
        open={supplementOpen}
        onOpenChange={handleSupplementOpenChange}
        onSubmit={handleSupplementSubmit}
        initialData={supplementInitial}
      />
      <DiaperSheet
        open={diaperOpen}
        onOpenChange={handleDiaperOpenChange}
        onSubmit={handleDiaperSubmit}
        initialData={diaperInitial}
      />
      <SleepSheet
        open={sleepOpen}
        onOpenChange={handleSleepOpenChange}
        onSubmit={handleSleepSubmit}
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
