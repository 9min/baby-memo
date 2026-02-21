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
  reorderPresets: (familyId: string, orderedIds: string[]) => Promise<void>
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
      .order('sort_order', { ascending: true })

    set({ presets: (data as SupplementPreset[]) ?? [], loading: false })
  },

  addPreset: async (familyId: string, name: string) => {
    const maxOrder = get().presets.reduce(
      (max, p) => Math.max(max, p.sort_order),
      -1,
    )

    const { error } = await supabase
      .from('supplement_presets')
      .insert({ family_id: familyId, name, sort_order: maxOrder + 1 })

    if (error) throw new Error('영양제 추가에 실패했습니다.')
  },

  deletePreset: async (id: string) => {
    const prev = get().presets
    set((state) => ({
      presets: state.presets.filter((p) => p.id !== id),
    }))

    const { error } = await supabase
      .from('supplement_presets')
      .delete()
      .eq('id', id)

    if (error) {
      set({ presets: prev })
      throw new Error('영양제 삭제에 실패했습니다.')
    }
  },

  reorderPresets: async (familyId: string, orderedIds: string[]) => {
    const prev = get().presets

    // Optimistic update
    const reordered = orderedIds
      .map((id, index) => {
        const preset = prev.find((p) => p.id === id)
        return preset ? { ...preset, sort_order: index } : null
      })
      .filter((p): p is SupplementPreset => p !== null)
    set({ presets: reordered })

    // Batch update via individual updates
    const updates = orderedIds.map((id, index) =>
      supabase
        .from('supplement_presets')
        .update({ sort_order: index })
        .eq('id', id)
        .eq('family_id', familyId),
    )

    const results = await Promise.all(updates)
    const hasError = results.some((r) => r.error)

    if (hasError) {
      set({ presets: prev })
      throw new Error('영양제 순서 변경에 실패했습니다.')
    }
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
            presets: [...state.presets, newPreset].sort((a, b) => a.sort_order - b.sort_order),
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
