import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { getDeviceId } from '@/lib/deviceUtils'
import { FAMILY_CODE_KEY, FAMILY_PASSWORD_KEY } from '@/lib/constants'
import { useDefaultsStore } from '@/stores/defaultsStore'
import { useDemoStore } from '@/stores/demoStore'

function generatePassword(): string {
  return String(Math.floor(Math.random() * 10000)).padStart(4, '0')
}

interface FamilyRow {
  id: string
  code: string
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
      const { data: families } = await supabase
        .rpc('get_family_by_code', { p_code: savedCode })

      const family = (families as FamilyRow[] | null)?.[0]
      if (!family) {
        localStorage.removeItem(FAMILY_CODE_KEY)
        localStorage.removeItem(FAMILY_PASSWORD_KEY)
        set({ initialized: true })
        return
      }

      // Check device is still registered
      const deviceId = get().deviceId
      const { data: device } = await supabase
        .from('devices')
        .select('id')
        .eq('device_id', deviceId)
        .eq('family_id', family.id)
        .single()

      if (!device) {
        localStorage.removeItem(FAMILY_CODE_KEY)
        localStorage.removeItem(FAMILY_PASSWORD_KEY)
        set({ initialized: true })
        return
      }

      const savedPassword = localStorage.getItem(FAMILY_PASSWORD_KEY)

      set({
        familyId: family.id,
        familyCode: family.code,
        familyPassword: savedPassword,
        initialized: true,
      })
    } catch {
      localStorage.removeItem(FAMILY_CODE_KEY)
      localStorage.removeItem(FAMILY_PASSWORD_KEY)
      set({ initialized: true })
    }
  },

  checkFamilyExists: async (code: string) => {
    const { data } = await supabase
      .rpc('get_family_by_code', { p_code: code.toUpperCase() })
    return !!(data as FamilyRow[] | null)?.[0]
  },

  joinOrCreate: async (code: string, password?: string) => {
    const upperCode = code.toUpperCase()

    let familyId: string
    let familyPassword: string

    // Check if family already exists
    const { data: existingFamilies } = await supabase
      .rpc('get_family_by_code', { p_code: upperCode })

    if ((existingFamilies as FamilyRow[] | null)?.[0]) {
      // Existing family — verify password via server-side bcrypt check
      const { data: verified } = await supabase
        .rpc('verify_family', { p_code: upperCode, p_password: password ?? '' })

      if (!(verified as FamilyRow[] | null)?.[0]) {
        throw new Error('비밀번호가 일치하지 않습니다.')
      }

      const verifiedFamily = (verified as FamilyRow[])[0]
      familyId = verifiedFamily.id
      familyPassword = password ?? ''
    } else {
      // Create new family with a random password
      const newPassword = generatePassword()
      const { data: created, error } = await supabase
        .rpc('create_family', { p_code: upperCode, p_password: newPassword })

      if (error || !(created as FamilyRow[] | null)?.[0]) {
        throw new Error('가족방 생성에 실패했습니다.')
      }

      familyId = (created as FamilyRow[])[0].id
      familyPassword = newPassword
    }

    // Register this device in the family
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
    localStorage.setItem(FAMILY_PASSWORD_KEY, familyPassword)
    set({ familyId, familyCode: upperCode, familyPassword })
  },

  updatePassword: async (password: string) => {
    if (useDemoStore.getState().isDemo) return

    const { familyId } = get()
    if (!familyId) return

    const { error } = await supabase
      .rpc('update_family_password', { p_family_id: familyId, p_new_password: password })

    if (error) {
      throw new Error('비밀번호 변경에 실패했습니다.')
    }

    localStorage.setItem(FAMILY_PASSWORD_KEY, password)
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
    localStorage.removeItem(FAMILY_PASSWORD_KEY)
    set({ familyId: null, familyCode: null, familyPassword: null })
  },

  deleteFamily: async (password: string) => {
    if (useDemoStore.getState().isDemo) return

    const { familyId, familyCode } = get()

    if (familyCode) {
      useDefaultsStore.getState().clearDefaults(familyCode)
    }

    if (familyId) {
      const { data: deleted, error } = await supabase
        .rpc('delete_family_secure', { p_family_id: familyId, p_password: password })

      if (error) {
        throw new Error('가족방 삭제에 실패했습니다.')
      }

      if (!deleted) {
        throw new Error('비밀번호가 일치하지 않습니다.')
      }
    }

    localStorage.removeItem(FAMILY_CODE_KEY)
    localStorage.removeItem(FAMILY_PASSWORD_KEY)
    set({ familyId: null, familyCode: null, familyPassword: null })
  },
}))
