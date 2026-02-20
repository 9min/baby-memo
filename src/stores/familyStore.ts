import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { getDeviceId } from '@/lib/deviceUtils'
import { FAMILY_CODE_KEY } from '@/lib/constants'

interface FamilyState {
  familyId: string | null
  familyCode: string | null
  deviceId: string
  nickname: string | null
  initialized: boolean

  initialize: () => Promise<void>
  joinOrCreate: (code: string) => Promise<void>
  leave: () => void
  updateNickname: (nickname: string) => Promise<void>
}

export const useFamilyStore = create<FamilyState>((set, get) => ({
  familyId: null,
  familyCode: null,
  deviceId: getDeviceId(),
  nickname: null,
  initialized: false,

  initialize: async () => {
    const savedCode = localStorage.getItem(FAMILY_CODE_KEY)
    if (!savedCode) {
      set({ initialized: true })
      return
    }

    try {
      const { data: family } = await supabase
        .from('families')
        .select('id, code')
        .eq('code', savedCode)
        .single()

      if (!family) {
        localStorage.removeItem(FAMILY_CODE_KEY)
        set({ initialized: true })
        return
      }

      const deviceId = get().deviceId
      const { data: device } = await supabase
        .from('devices')
        .select('nickname')
        .eq('device_id', deviceId)
        .eq('family_id', family.id)
        .single()

      set({
        familyId: family.id,
        familyCode: family.code,
        nickname: device?.nickname ?? null,
        initialized: true,
      })
    } catch {
      localStorage.removeItem(FAMILY_CODE_KEY)
      set({ initialized: true })
    }
  },

  joinOrCreate: async (code: string) => {
    const upperCode = code.toUpperCase()

    // Try to find existing family
    const { data: existing } = await supabase
      .from('families')
      .select('id, code')
      .eq('code', upperCode)
      .single()

    let familyId: string

    if (existing) {
      familyId = existing.id
    } else {
      // Create new family
      const { data: created, error } = await supabase
        .from('families')
        .insert({ code: upperCode })
        .select('id, code')
        .single()

      if (error || !created) {
        throw new Error('가족방 생성에 실패했습니다.')
      }
      familyId = created.id
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
    set({ familyId, familyCode: upperCode, nickname: null })
  },

  leave: () => {
    localStorage.removeItem(FAMILY_CODE_KEY)
    set({ familyId: null, familyCode: null, nickname: null })
  },

  updateNickname: async (nickname: string) => {
    const { familyId, deviceId } = get()
    if (!familyId) return

    const { error } = await supabase
      .from('devices')
      .update({ nickname })
      .eq('device_id', deviceId)
      .eq('family_id', familyId)

    if (error) {
      throw new Error('닉네임 변경에 실패했습니다.')
    }

    set({ nickname })
  },
}))
