import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Check } from 'lucide-react'
import { useFamilyStore } from '@/stores/familyStore'
import { useActivityStore } from '@/stores/activityStore'
import { ACTIVITY_CONFIGS, ACTIVITY_TYPES } from '@/lib/activityConfig'
import ActivityButton from '@/components/activity/ActivityButton'
import ActivityCard from '@/components/activity/ActivityCard'
import SolidFoodSheet from '@/components/activity/SolidFoodSheet'
import DrinkSheet from '@/components/activity/DrinkSheet'
import SupplementSheet from '@/components/activity/SupplementSheet'
import DiaperSheet from '@/components/activity/DiaperSheet'
import type { ActivityType, SolidFoodMetadata, DrinkMetadata, SupplementMetadata, DiaperMetadata } from '@/types/database'

const HomePage = () => {
  const familyId = useFamilyStore((s) => s.familyId)
  const deviceId = useFamilyStore((s) => s.deviceId)
  const activities = useActivityStore((s) => s.activities)
  const recordActivity = useActivityStore((s) => s.recordActivity)

  const [solidFoodOpen, setSolidFoodOpen] = useState(false)
  const [drinkOpen, setDrinkOpen] = useState(false)
  const [supplementOpen, setSupplementOpen] = useState(false)
  const [diaperOpen, setDiaperOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const recentActivities = activities.slice(0, 5)

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 2000)
  }

  const handleActivityPress = (type: ActivityType) => {
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
    }
  }

  const handleSolidFood = (metadata: SolidFoodMetadata, recordedAt: Date) => {
    if (!familyId) return
    recordActivity({
      familyId,
      deviceId,
      type: 'solid_food',
      recordedAt: recordedAt.toISOString(),
      metadata,
    })
    showToast('먹어요 기록 완료')
  }

  const handleDrink = (metadata: DrinkMetadata, recordedAt: Date) => {
    if (!familyId) return
    recordActivity({
      familyId,
      deviceId,
      type: 'drink',
      recordedAt: recordedAt.toISOString(),
      metadata,
    })
    showToast('마셔요 기록 완료')
  }

  const handleSupplement = (metadata: SupplementMetadata, recordedAt: Date) => {
    if (!familyId) return
    recordActivity({
      familyId,
      deviceId,
      type: 'supplement',
      recordedAt: recordedAt.toISOString(),
      metadata,
    })
    showToast('영양제 기록 완료')
  }

  const handleDiaper = (metadata: DiaperMetadata, recordedAt: Date) => {
    if (!familyId) return
    recordActivity({
      familyId,
      deviceId,
      type: 'diaper',
      recordedAt: recordedAt.toISOString(),
      metadata,
    })
    showToast('기저귀 기록 완료')
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Activity Buttons */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          활동 기록
        </h2>
        <div className="grid grid-cols-2 gap-3">
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
          <h2 className="text-sm font-semibold text-muted-foreground">
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
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-10 text-center">
            <p className="text-sm text-muted-foreground">
              아직 기록이 없어요
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              위 버튼을 눌러 첫 활동을 기록해보세요
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {recentActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>

      {/* Activity Sheets */}
      <SolidFoodSheet
        open={solidFoodOpen}
        onOpenChange={setSolidFoodOpen}
        onSubmit={handleSolidFood}
      />
      <DrinkSheet
        open={drinkOpen}
        onOpenChange={setDrinkOpen}
        onSubmit={handleDrink}
      />
      <SupplementSheet
        open={supplementOpen}
        onOpenChange={setSupplementOpen}
        onSubmit={handleSupplement}
      />
      <DiaperSheet
        open={diaperOpen}
        onOpenChange={setDiaperOpen}
        onSubmit={handleDiaper}
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
