import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Check } from 'lucide-react'
import { formatBabyAge } from '@/lib/babyUtils'
import { useFamilyStore } from '@/stores/familyStore'
import { useActivityStore } from '@/stores/activityStore'
import { useBabyStore } from '@/stores/babyStore'
import { ACTIVITY_CONFIGS, ACTIVITY_TYPES } from '@/lib/activityConfig'
import ActivityButton from '@/components/activity/ActivityButton'
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

const HomePage = () => {
  const familyId = useFamilyStore((s) => s.familyId)
  const deviceId = useFamilyStore((s) => s.deviceId)
  const members = useFamilyStore((s) => s.members)
  const activities = useActivityStore((s) => s.activities)
  const babies = useBabyStore((s) => s.babies)
  const recordActivity = useActivityStore((s) => s.recordActivity)
  const updateActivity = useActivityStore((s) => s.updateActivity)
  const setSelectedDate = useActivityStore((s) => s.setSelectedDate)

  useEffect(() => {
    setSelectedDate(new Date())
  }, [setSelectedDate])

  const [solidFoodOpen, setSolidFoodOpen] = useState(false)
  const [drinkOpen, setDrinkOpen] = useState(false)
  const [supplementOpen, setSupplementOpen] = useState(false)
  const [diaperOpen, setDiaperOpen] = useState(false)
  const [sleepOpen, setSleepOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
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

  const recentActivities = useMemo(() => activities.slice(0, 5), [activities])

  const showToast = useCallback((message: string) => {
    setToast(message)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(null), 2000)
  }, [])

  const handleActivityPress = useCallback((type: ActivityType) => {
    setEditingActivity(null)
    switch (type) {
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
      showToast(toastMsg.replace('기록', '수정'))
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
    handleSubmit('solid_food', metadata, recordedAt, '먹어요 기록 완료')
  }, [handleSubmit])

  const handleDrinkSubmit = useCallback((metadata: DrinkMetadata, recordedAt: Date) => {
    handleSubmit('drink', metadata, recordedAt, '마셔요 기록 완료')
  }, [handleSubmit])

  const handleSupplementSubmit = useCallback((metadata: SupplementMetadata, recordedAt: Date) => {
    handleSubmit('supplement', metadata, recordedAt, '영양제 기록 완료')
  }, [handleSubmit])

  const handleDiaperSubmit = useCallback((metadata: DiaperMetadata, recordedAt: Date) => {
    handleSubmit('diaper', metadata, recordedAt, '기저귀 기록 완료')
  }, [handleSubmit])

  const handleSleepSubmit = useCallback((metadata: SleepMetadata, recordedAt: Date) => {
    handleSubmit('sleep', metadata, recordedAt, '잠자요 기록 완료')
  }, [handleSubmit])

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Baby Info */}
      {babies.length > 0 && (
        <div className="flex items-center gap-3">
          {babies.map((baby) => (
            <div
              key={baby.id}
              className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5"
            >
              <span className="text-sm font-bold text-primary">{baby.name}</span>
              <span className="text-xs text-primary/70">{formatBabyAge(baby.birthdate)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Activity Buttons */}
      <div>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          활동 기록
        </h2>
        <div className="grid grid-cols-3 gap-2.5">
          {ACTIVITY_TYPES.map((type) => (
            <ActivityButton
              key={type}
              config={ACTIVITY_CONFIGS[type]}
              onClick={() => handleActivityPress(type)}
            />
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            최근 활동
          </h2>
          {recentActivities.length > 0 && (
            <Link
              to="/timeline"
              className="flex min-h-[44px] cursor-pointer items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              더보기
              <ChevronRight className="h-3 w-3" />
            </Link>
          )}
        </div>
        {recentActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary/20 bg-primary/[0.02] py-10 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              아직 기록이 없어요
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              위 버튼을 눌러 첫 활동을 기록해보세요
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {recentActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} onEdit={handleEdit} deviceNickname={deviceMap[activity.device_id]} />
            ))}
          </div>
        )}
      </div>

      {/* Activity Sheets */}
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

export default HomePage
