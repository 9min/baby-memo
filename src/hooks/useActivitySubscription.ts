import { useEffect } from 'react'
import { useFamilyStore } from '@/stores/familyStore'
import { useActivityStore } from '@/stores/activityStore'
import { useBabyStore } from '@/stores/babyStore'

export const useActivitySubscription = () => {
  const familyId = useFamilyStore((s) => s.familyId)
  const subscribe = useActivityStore((s) => s.subscribe)
  const unsubscribe = useActivityStore((s) => s.unsubscribe)
  const fetchActivities = useActivityStore((s) => s.fetchActivities)
  const fetchRecentActivities = useActivityStore((s) => s.fetchRecentActivities)
  const selectedDate = useActivityStore((s) => s.selectedDate)
  const subscribeBabies = useBabyStore((s) => s.subscribe)
  const unsubscribeBabies = useBabyStore((s) => s.unsubscribe)
  const fetchBabies = useBabyStore((s) => s.fetchBabies)

  useEffect(() => {
    if (!familyId) return

    subscribe(familyId)
    subscribeBabies(familyId)
    fetchBabies(familyId)

    return () => {
      unsubscribe()
      unsubscribeBabies()
    }
  }, [familyId, subscribe, unsubscribe, subscribeBabies, unsubscribeBabies, fetchBabies])

  useEffect(() => {
    if (!familyId) return
    fetchActivities(familyId, selectedDate)
  }, [familyId, selectedDate, fetchActivities])

  useEffect(() => {
    if (!familyId) return
    fetchRecentActivities(familyId)
  }, [familyId, fetchRecentActivities])
}
