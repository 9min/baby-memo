import { useEffect } from 'react'
import { useFamilyStore } from '@/stores/familyStore'
import { useActivityStore } from '@/stores/activityStore'

export const useActivitySubscription = () => {
  const familyId = useFamilyStore((s) => s.familyId)
  const subscribe = useActivityStore((s) => s.subscribe)
  const unsubscribe = useActivityStore((s) => s.unsubscribe)
  const fetchActivities = useActivityStore((s) => s.fetchActivities)
  const selectedDate = useActivityStore((s) => s.selectedDate)

  useEffect(() => {
    if (!familyId) return

    subscribe(familyId)

    return () => {
      unsubscribe()
    }
  }, [familyId, subscribe, unsubscribe])

  useEffect(() => {
    if (!familyId) return
    fetchActivities(familyId, selectedDate)
  }, [familyId, selectedDate, fetchActivities])
}
