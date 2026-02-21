import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Baby } from '@/types/database'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface BabyState {
  babies: Baby[]
  loading: boolean
  channel: RealtimeChannel | null

  fetchBabies: (familyId: string) => Promise<void>
  addBaby: (familyId: string, name: string, birthdate: string) => Promise<void>
  deleteBaby: (id: string) => Promise<void>
  subscribe: (familyId: string) => void
  unsubscribe: () => void
}

export const useBabyStore = create<BabyState>((set, get) => ({
  babies: [],
  loading: false,
  channel: null,

  fetchBabies: async (familyId: string) => {
    set({ loading: true })
    const { data } = await supabase
      .from('babies')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: true })

    set({ babies: (data as Baby[]) ?? [], loading: false })
  },

  addBaby: async (familyId: string, name: string, birthdate: string) => {
    const { error } = await supabase
      .from('babies')
      .insert({ family_id: familyId, name, birthdate })

    if (error) throw new Error('아기 추가에 실패했습니다.')
  },

  deleteBaby: async (id: string) => {
    const prev = get().babies
    set((state) => ({
      babies: state.babies.filter((b) => b.id !== id),
    }))

    const { error } = await supabase
      .from('babies')
      .delete()
      .eq('id', id)

    if (error) {
      set({ babies: prev })
      throw new Error('아기 삭제에 실패했습니다.')
    }
  },

  subscribe: (familyId: string) => {
    const existing = get().channel
    if (existing) {
      supabase.removeChannel(existing)
    }

    const channel = supabase
      .channel(`babies:${familyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'babies',
          filter: `family_id=eq.${familyId}`,
        },
        (payload) => {
          const newBaby = payload.new as Baby
          set((state) => ({
            babies: [...state.babies, newBaby],
          }))
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'babies',
          filter: `family_id=eq.${familyId}`,
        },
        (payload) => {
          const deleted = payload.old as { id: string }
          set((state) => ({
            babies: state.babies.filter((b) => b.id !== deleted.id),
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
