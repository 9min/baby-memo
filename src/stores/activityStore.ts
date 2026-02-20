import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Activity, ActivityType, ActivityMetadata } from '@/types/database'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface ActivityState {
  activities: Activity[]
  loading: boolean
  selectedDate: Date
  channel: RealtimeChannel | null

  setSelectedDate: (date: Date) => void
  fetchActivities: (familyId: string, date: Date) => Promise<void>
  recordActivity: (params: {
    familyId: string
    deviceId: string
    type: ActivityType
    recordedAt: string
    metadata: ActivityMetadata
    memo?: string
  }) => Promise<void>
  updateActivity: (params: {
    activityId: string
    recordedAt: string
    metadata: ActivityMetadata
  }) => Promise<void>
  deleteActivity: (activityId: string) => Promise<void>
  subscribe: (familyId: string) => void
  unsubscribe: () => void
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: [],
  loading: false,
  selectedDate: new Date(),
  channel: null,

  setSelectedDate: (date: Date) => {
    set({ selectedDate: date })
  },

  fetchActivities: async (familyId: string, date: Date) => {
    set({ loading: true })
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const { data } = await supabase
      .from('activities')
      .select('*')
      .eq('family_id', familyId)
      .gte('recorded_at', startOfDay.toISOString())
      .lte('recorded_at', endOfDay.toISOString())
      .order('recorded_at', { ascending: false })

    set({ activities: (data as Activity[]) ?? [], loading: false })
  },

  recordActivity: async ({ familyId, deviceId, type, recordedAt, metadata, memo }) => {
    const { error } = await supabase
      .from('activities')
      .insert({
        family_id: familyId,
        device_id: deviceId,
        type,
        recorded_at: recordedAt,
        metadata,
        memo: memo || null,
      })

    if (error) throw new Error('활동 기록에 실패했습니다.')
  },

  updateActivity: async ({ activityId, recordedAt, metadata }) => {
    const { error } = await supabase
      .from('activities')
      .update({
        recorded_at: recordedAt,
        metadata,
      })
      .eq('id', activityId)

    if (error) throw new Error('활동 수정에 실패했습니다.')
  },

  deleteActivity: async (activityId: string) => {
    const prev = get().activities
    set((state) => ({
      activities: state.activities.filter((a) => a.id !== activityId),
    }))

    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', activityId)

    if (error) {
      set({ activities: prev })
      throw new Error('활동 삭제에 실패했습니다.')
    }
  },

  subscribe: (familyId: string) => {
    const existing = get().channel
    if (existing) {
      supabase.removeChannel(existing)
    }

    const channel = supabase
      .channel(`activities:${familyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activities',
          filter: `family_id=eq.${familyId}`,
        },
        (payload) => {
          const newActivity = payload.new as Activity
          const selectedDate = get().selectedDate
          const activityDate = new Date(newActivity.recorded_at)
          if (
            activityDate.getFullYear() === selectedDate.getFullYear() &&
            activityDate.getMonth() === selectedDate.getMonth() &&
            activityDate.getDate() === selectedDate.getDate()
          ) {
            set((state) => ({
              activities: [newActivity, ...state.activities].sort(
                (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime(),
              ),
            }))
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'activities',
          filter: `family_id=eq.${familyId}`,
        },
        (payload) => {
          const updated = payload.new as Activity
          set((state) => ({
            activities: state.activities
              .map((a) => (a.id === updated.id ? updated : a))
              .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()),
          }))
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'activities',
          filter: `family_id=eq.${familyId}`,
        },
        (payload) => {
          const deleted = payload.old as { id: string }
          set((state) => ({
            activities: state.activities.filter((a) => a.id !== deleted.id),
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
