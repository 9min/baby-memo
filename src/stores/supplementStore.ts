import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { SupplementPreset } from '@/types/database'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface SupplementState {
  presets: SupplementPreset[]
  loading: boolean
  channel: RealtimeChannel | null

  fetchPresets: (familyId: string) => Promise<void>
  addPreset: (familyId: string, name: string) => Promise<void>
  deletePreset: (id: string) => Promise<void>
  subscribe: (familyId: string) => void
  unsubscribe: () => void
}

export const useSupplementStore = create<SupplementState>((set, get) => ({
  presets: [],
  loading: false,
  channel: null,

  fetchPresets: async (familyId: string) => {
    set({ loading: true })
    const { data } = await supabase
      .from('supplement_presets')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: true })

    set({ presets: (data as SupplementPreset[]) ?? [], loading: false })
  },

  addPreset: async (familyId: string, name: string) => {
    const { error } = await supabase
      .from('supplement_presets')
      .insert({ family_id: familyId, name })

    if (error) throw new Error('영양제 추가에 실패했습니다.')
  },

  deletePreset: async (id: string) => {
    const { error } = await supabase
      .from('supplement_presets')
      .delete()
      .eq('id', id)

    if (error) throw new Error('영양제 삭제에 실패했습니다.')
  },

  subscribe: (familyId: string) => {
    const existing = get().channel
    if (existing) {
      supabase.removeChannel(existing)
    }

    const channel = supabase
      .channel(`supplement_presets:${familyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'supplement_presets',
          filter: `family_id=eq.${familyId}`,
        },
        (payload) => {
          const newPreset = payload.new as SupplementPreset
          set((state) => ({
            presets: [...state.presets, newPreset],
          }))
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'supplement_presets',
          filter: `family_id=eq.${familyId}`,
        },
        (payload) => {
          const deleted = payload.old as { id: string }
          set((state) => ({
            presets: state.presets.filter((p) => p.id !== deleted.id),
          }))
        },
      )
      .subscribe()

    set({ channel })
  },

  unsubscribe: () => {
    const channel = get().channel
    if (channel) {
      supabase.removeChannel(channel)
      set({ channel: null })
    }
  },
}))
