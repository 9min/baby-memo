import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { getDeviceId } from '@/lib/deviceUtils'
import { FAMILY_CODE_KEY } from '@/lib/constants'
import { useDefaultsStore } from '@/stores/defaultsStore'
import { useDemoStore } from '@/stores/demoStore'

function generatePassword(): string {
  return String(Math.floor(Math.random() * 10000)).padStart(4, '0')
}

interface FamilyState {
  familyId: string | null
  familyCode: string | null
  familyPassword: string | null
  deviceId: string
  initialized: boolean

  initialize: () => Promise<void>
  initializeDemo: (familyId: string, familyCode: string, deviceId: string) => void
  checkFamilyExists: (code: string) => Promise<boolean>
  joinOrCreate: (code: string, password?: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  leave: () => Promise<void>
  deleteFamily: (password: string) => Promise<void>
}

export const useFamilyStore = create<FamilyState>((set, get) => ({
  familyId: null,
  familyCode: null,
  familyPassword: null,
  deviceId: getDeviceId(),
  initialized: false,

  initializeDemo: (familyId: string, familyCode: string, deviceId: string) => {
    set({
      familyId,
      familyCode,
      familyPassword: '0000',
      deviceId,
      initialized: true,
    })
  },

  initialize: async () => {
    const savedCode = localStorage.getItem(FAMILY_CODE_KEY)
    if (!savedCode) {
      set({ initialized: true })
      return
    }

    try {
      const { data: family } = await supabase
        .from('families')
        .select('id, code, password')
        .eq('code', savedCode)
        .single()

      if (!family) {
        localStorage.removeItem(FAMILY_CODE_KEY)
        set({ initialized: true })
        return
      }

      // Check device is registered
      const deviceId = get().deviceId
      const { data: device } = await supabase
        .from('devices')
        .select('id')
        .eq('device_id', deviceId)
        .eq('family_id', family.id)
        .single()

      if (!device) {
        localStorage.removeItem(FAMILY_CODE_KEY)
        set({ initialized: true })
        return
      }

      set({
        familyId: family.id,
        familyCode: family.code,
        familyPassword: family.password,
        initialized: true,
      })
    } catch {
      localStorage.removeItem(FAMILY_CODE_KEY)
      set({ initialized: true })
    }
  },

  checkFamilyExists: async (code: string) => {
    const { data } = await supabase
      .from('families')
      .select('id')
      .eq('code', code.toUpperCase())
      .single()

    return !!data
  },

  joinOrCreate: async (code: string, password?: string) => {
    const upperCode = code.toUpperCase()

    // Try to find existing family
    const { data: existing } = await supabase
      .from('families')
      .select('id, code, password')
      .eq('code', upperCode)
      .single()

    let familyId: string
    let familyPassword: string

    if (existing) {
      // Existing family — verify password
      if (existing.password !== password) {
        throw new Error('비밀번호가 일치하지 않습니다.')
      }
      familyId = existing.id
      familyPassword = existing.password
    } else {
      // Create new family with random password
      const newPassword = generatePassword()
      const { data: created, error } = await supabase
        .from('families')
        .insert({ code: upperCode, password: newPassword })
        .select('id, code, password')
        .single()

      if (error || !created) {
        throw new Error('가족방 생성에 실패했습니다.')
      }
      familyId = created.id
      familyPassword = created.password
    }

    // Upsert device into this family
    const deviceId = get().deviceId
    const { error: deviceError } = await supabase
      .from('devices')
      .upsert(
        { device_id: deviceId, family_id: familyId },
        { onConflict: 'device_id' },
      )

    if (deviceError) {
      throw new Error('기기 등록에 실패했습니다.')
    }

    localStorage.setItem(FAMILY_CODE_KEY, upperCode)
    set({ familyId, familyCode: upperCode, familyPassword })
  },

  updatePassword: async (password: string) => {
    if (useDemoStore.getState().isDemo) return

    const { familyId } = get()
    if (!familyId) return

    const { error } = await supabase
      .from('families')
      .update({ password })
      .eq('id', familyId)

    if (error) {
      throw new Error('비밀번호 변경에 실패했습니다.')
    }

    set({ familyPassword: password })
  },

  leave: async () => {
    if (useDemoStore.getState().isDemo) {
      useDemoStore.getState().exitDemo()
      set({ familyId: null, familyCode: null, familyPassword: null })
      return
    }

    const { familyId, familyCode, deviceId } = get()

    if (familyCode) {
      useDefaultsStore.getState().clearDefaults(familyCode)
    }

    if (familyId) {
      await supabase
        .from('devices')
        .delete()
        .eq('device_id', deviceId)
        .eq('family_id', familyId)
    }

    localStorage.removeItem(FAMILY_CODE_KEY)
    set({ familyId: null, familyCode: null, familyPassword: null })
  },

  deleteFamily: async (password: string) => {
    if (useDemoStore.getState().isDemo) return

    const { familyId, familyCode, familyPassword, deviceId } = get()

    if (password !== familyPassword) {
      throw new Error('비밀번호가 일치하지 않습니다.')
    }

    if (familyCode) {
      useDefaultsStore.getState().clearDefaults(familyCode)
    }

    if (familyId) {
      await supabase
        .from('devices')
        .delete()
        .eq('device_id', deviceId)
        .eq('family_id', familyId)

      await supabase
        .from('families')
        .delete()
        .eq('id', familyId)
    }

    localStorage.removeItem(FAMILY_CODE_KEY)
    set({ familyId: null, familyCode: null, familyPassword: null })
  },
}))
