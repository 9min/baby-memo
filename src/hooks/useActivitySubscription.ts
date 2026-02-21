import { useEffect } from 'react'
import { useFamilyStore } from '@/stores/familyStore'
import { useActivityStore } from '@/stores/activityStore'
import { useBabyStore } from '@/stores/babyStore'

export const useActivitySubscription = () => {
  const familyId = useFamilyStore((s) => s.familyId)
  const subscribe = useActivityStore((s) => s.subscribe)
  const unsubscribe = useActivityStore((s) => s.unsubscribe)
  const fetchActivities = useActivityStore((s) => s.fetchActivities)
  const selectedDate = useActivityStore((s) => s.selectedDate)
  const subscribeBabies = useBabyStore((s) => s.subscribe)
  const unsubscribeBabies = useBabyStore((s) => s.unsubscribe)
  const fetchBabies = useBabyStore((s) => s.fetchBabies)
  const subscribeDevices = useFamilyStore((s) => s.subscribeDevices)
  const unsubscribeDevices = useFamilyStore((s) => s.unsubscribeDevices)

  useEffect(() => {
    if (!familyId) return

    subscribe(familyId)
    subscribeBabies(familyId)
    subscribeDevices(familyId)
    fetchBabies(familyId)

    return () => {
      unsubscribe()
      unsubscribeBabies()
      unsubscribeDevices()
    }
  }, [familyId, subscribe, unsubscribe, subscribeBabies, unsubscribeBabies, fetchBabies, subscribeDevices, unsubscribeDevices])

  useEffect(() => {
    if (!familyId) return
    fetchActivities(familyId, selectedDate)
  }, [familyId, selectedDate, fetchActivities])
}
