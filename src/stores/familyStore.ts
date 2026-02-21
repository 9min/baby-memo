import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { getDeviceId } from '@/lib/deviceUtils'
import { FAMILY_CODE_KEY } from '@/lib/constants'
import { useDefaultsStore } from '@/stores/defaultsStore'
import { generateNickname } from '@/lib/nicknameGenerator'
import type { Device } from '@/types/database'
import type { RealtimeChannel } from '@supabase/supabase-js'

function generatePassword(): string {
  return String(Math.floor(Math.random() * 10000)).padStart(4, '0')
}

async function generateUniqueNickname(familyId: string): Promise<string> {
  const { data: existingDevices } = await supabase
    .from('devices')
    .select('nickname')
    .eq('family_id', familyId)

  const existingNicknames = (existingDevices ?? [])
    .map((d) => d.nickname as string)
    .filter(Boolean)

  return generateNickname(existingNicknames)
}

interface FamilyState {
  familyId: string | null
  familyCode: string | null
  familyPassword: string | null
  deviceId: string
  initialized: boolean
  nickname: string | null
  members: Device[]
  deviceChannel: RealtimeChannel | null

  initialize: () => Promise<void>
  checkFamilyExists: (code: string) => Promise<boolean>
  joinOrCreate: (code: string, password?: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  getDeviceCount: () => Promise<number>
  leave: () => Promise<void>
  setNickname: (nickname: string) => Promise<void>
  fetchMembers: (familyId: string) => Promise<void>
  kickMember: (targetDeviceId: string) => Promise<void>
  subscribeDevices: (familyId: string) => void
  unsubscribeDevices: () => void
}

export const useFamilyStore = create<FamilyState>((set, get) => ({
  familyId: null,
  familyCode: null,
  familyPassword: null,
  deviceId: getDeviceId(),
  initialized: false,
  nickname: null,
  members: [],
  deviceChannel: null,

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
        nickname = await generateUniqueNickname(family.id)

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
    const nickname = await generateUniqueNickname(familyId)

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
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Failed to fetch members:', error)
      return
    }

    if (data) {
      set({ members: data as Device[] })
    }
  },

  kickMember: async (targetDeviceId: string) => {
    const { familyId, deviceId, members } = get()
    if (!familyId) return

    // Only room owner (members[0]) can kick
    if (members.length === 0 || members[0].device_id !== deviceId) {
      throw new Error('방장만 구성원을 내보낼 수 있습니다.')
    }

    // Cannot kick self
    if (targetDeviceId === deviceId) {
      throw new Error('자기 자신을 내보낼 수 없습니다.')
    }

    const { error } = await supabase
      .from('devices')
      .delete()
      .eq('device_id', targetDeviceId)
      .eq('family_id', familyId)

    if (error) {
      throw new Error('구성원 내보내기에 실패했습니다.')
    }

    await get().fetchMembers(familyId)
  },

  subscribeDevices: (familyId: string) => {
    const existing = get().deviceChannel
    if (existing) {
      supabase.removeChannel(existing)
    }

    const channel = supabase
      .channel(`devices:${familyId}`)
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'devices',
          filter: `family_id=eq.${familyId}`,
        },
        (payload) => {
          const deleted = payload.old as { device_id: string }
          if (deleted.device_id === get().deviceId) {
            // Current device was kicked — clear state and redirect
            localStorage.removeItem(FAMILY_CODE_KEY)
            set({
              familyId: null,
              familyCode: null,
              familyPassword: null,
              nickname: null,
              members: [],
            })
          } else {
            // Another member was removed — refresh members list
            get().fetchMembers(familyId)
          }
        },
      )
      .subscribe()

    set({ deviceChannel: channel })
  },

  unsubscribeDevices: () => {
    const channel = get().deviceChannel
    if (channel) {
      supabase.removeChannel(channel)
      set({ deviceChannel: null })
    }
  },
}))
