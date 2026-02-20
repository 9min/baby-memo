import { useEffect } from 'react'
import { useFamilyStore } from '@/stores/familyStore'

export const useFamily = () => {
  const initialize = useFamilyStore((s) => s.initialize)
  const initialized = useFamilyStore((s) => s.initialized)
  const familyId = useFamilyStore((s) => s.familyId)
  const familyCode = useFamilyStore((s) => s.familyCode)
  const deviceId = useFamilyStore((s) => s.deviceId)
  const nickname = useFamilyStore((s) => s.nickname)
  const joinOrCreate = useFamilyStore((s) => s.joinOrCreate)
  const leave = useFamilyStore((s) => s.leave)
  const updateNickname = useFamilyStore((s) => s.updateNickname)

  useEffect(() => {
    initialize()
  }, [initialize])

  return {
    initialized,
    familyId,
    familyCode,
    deviceId,
    nickname,
    joinOrCreate,
    leave,
    updateNickname,
  }
}
