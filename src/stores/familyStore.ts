import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { getDeviceId } from '@/lib/deviceUtils'
import { FAMILY_CODE_KEY } from '@/lib/constants'
import { useDefaultsStore } from '@/stores/defaultsStore'
import { generateNickname } from '@/lib/nicknameGenerator'
import type { Device } from '@/types/database'

function generatePassword(): string {
  return String(Math.floor(Math.random() * 10000)).padStart(4, '0')
}

interface FamilyState {
  familyId: string | null
  familyCode: string | null
  familyPassword: string | null
  deviceId: string
  initialized: boolean
  nickname: string | null
  members: Device[]

  initialize: () => Promise<void>
  checkFamilyExists: (code: string) => Promise<boolean>
  joinOrCreate: (code: string, password?: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  getDeviceCount: () => Promise<number>
  leave: () => Promise<void>
  setNickname: (nickname: string) => Promise<void>
  fetchMembers: (familyId: string) => Promise<void>
}

export const useFamilyStore = create<FamilyState>((set, get) => ({
  familyId: null,
  familyCode: null,
  familyPassword: null,
  deviceId: getDeviceId(),
  initialized: false,
  nickname: null,
  members: [],

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
        .select('id, nickname')
        .eq('device_id', deviceId)
        .eq('family_id', family.id)
        .single()

      if (!device) {
        localStorage.removeItem(FAMILY_CODE_KEY)
        set({ initialized: true })
        return
      }

      let nickname = device.nickname as string | null

      // Auto-generate nickname if missing
      if (!nickname) {
        const { data: existingDevices } = await supabase
          .from('devices')
          .select('nickname')
          .eq('family_id', family.id)

        const existingNicknames = (existingDevices ?? [])
          .map((d) => d.nickname as string)
          .filter(Boolean)

        nickname = generateNickname(existingNicknames)

        await supabase
          .from('devices')
          .update({ nickname })
          .eq('device_id', deviceId)
          .eq('family_id', family.id)
      }

      set({
        familyId: family.id,
        familyCode: family.code,
        familyPassword: family.password,
        nickname,
        initialized: true,
      })

      // Fetch members in background
      get().fetchMembers(family.id)
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

    // Generate unique nickname
    const { data: existingDevices } = await supabase
      .from('devices')
      .select('nickname')
      .eq('family_id', familyId)

    const existingNicknames = (existingDevices ?? [])
      .map((d) => d.nickname as string)
      .filter(Boolean)

    const nickname = generateNickname(existingNicknames)

    // Upsert device into this family
    const deviceId = get().deviceId
    const { error: deviceError } = await supabase
      .from('devices')
      .upsert(
        { device_id: deviceId, family_id: familyId, nickname },
        { onConflict: 'device_id' },
      )

    if (deviceError) {
      throw new Error('기기 등록에 실패했습니다.')
    }

    localStorage.setItem(FAMILY_CODE_KEY, upperCode)
    set({ familyId, familyCode: upperCode, familyPassword, nickname })

    // Fetch members in background
    get().fetchMembers(familyId)
  },

  updatePassword: async (password: string) => {
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

  getDeviceCount: async () => {
    const { familyId } = get()
    if (!familyId) return 0

    const { count } = await supabase
      .from('devices')
      .select('*', { count: 'exact', head: true })
      .eq('family_id', familyId)

    return count ?? 0
  },

  leave: async () => {
    const { familyId, familyCode, deviceId } = get()

    if (familyCode) {
      useDefaultsStore.getState().clearDefaults(familyCode)
    }

    if (familyId) {
      // Delete this device from the family
      await supabase
        .from('devices')
        .delete()
        .eq('device_id', deviceId)
        .eq('family_id', familyId)

      // Check if any devices remain in this family
      const { count } = await supabase
        .from('devices')
        .select('*', { count: 'exact', head: true })
        .eq('family_id', familyId)

      // If no devices remain, delete the family (cascades to activities, supplement_presets)
      if (!count) {
        await supabase
          .from('families')
          .delete()
          .eq('id', familyId)
      }
    }

    localStorage.removeItem(FAMILY_CODE_KEY)
    set({ familyId: null, familyCode: null, familyPassword: null, nickname: null, members: [] })
  },

  setNickname: async (nickname: string) => {
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

  fetchMembers: async (familyId: string) => {
    const { data } = await supabase
      .from('devices')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: true })

    if (data) {
      set({ members: data as Device[] })
    }
  },
}))
