import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Activity, ActivityType, ActivityMetadata } from '@/types/database'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { useDemoStore } from '@/stores/demoStore'

interface ActivityState {
  activities: Activity[]
  recentActivities: Activity[]
  loading: boolean
  selectedDate: Date
  channel: RealtimeChannel | null
  monthlyActivityDates: Record<string, number>
  _allDemoActivities: Activity[]

  initializeDemo: (activities: Activity[]) => void
  setSelectedDate: (date: Date) => void
  fetchActivities: (familyId: string, date: Date) => Promise<void>
  fetchRecentActivities: (familyId: string) => Promise<void>
  fetchMonthlyActivityDates: (familyId: string, year: number, month: number) => Promise<void>
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
  recentActivities: [],
  loading: false,
  selectedDate: new Date(),
  channel: null,
  monthlyActivityDates: {},
  _allDemoActivities: [],

  initializeDemo: (activities: Activity[]) => {
    set({ _allDemoActivities: activities })
  },

  setSelectedDate: (date: Date) => {
    set({ selectedDate: date })
  },

  fetchActivities: async (familyId: string, date: Date) => {
    set({ loading: true })
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    if (useDemoStore.getState().isDemo) {
      const startMs = startOfDay.getTime()
      const endMs = endOfDay.getTime()
      const filtered = get()._allDemoActivities.filter((a) => {
        const t = new Date(a.recorded_at).getTime()
        return t >= startMs && t <= endMs
      })
      set({ activities: filtered, loading: false })
      return
    }

    const { data } = await supabase
      .from('activities')
      .select('*')
      .eq('family_id', familyId)
      .gte('recorded_at', startOfDay.toISOString())
      .lte('recorded_at', endOfDay.toISOString())
      .order('recorded_at', { ascending: true })

    set({ activities: (data as Activity[]) ?? [], loading: false })
  },

  fetchRecentActivities: async (familyId: string) => {
    if (useDemoStore.getState().isDemo) {
      const recent = [...get()._allDemoActivities]
        .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())
        .slice(0, 5)
      set({ recentActivities: recent })
      return
    }

    const { data } = await supabase
      .from('activities')
      .select('*')
      .eq('family_id', familyId)
      .order('recorded_at', { ascending: false })
      .limit(5)

    set({ recentActivities: (data as Activity[]) ?? [] })
  },

  fetchMonthlyActivityDates: async (familyId: string, year: number, month: number) => {
    const startOfMonth = new Date(year, month, 1)
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999)

    if (useDemoStore.getState().isDemo) {
      const startMs = startOfMonth.getTime()
      const endMs = endOfMonth.getTime()
      const counts: Record<string, number> = {}
      for (const a of get()._allDemoActivities) {
        const t = new Date(a.recorded_at).getTime()
        if (t >= startMs && t <= endMs) {
          const dateKey = a.recorded_at.slice(0, 10)
          counts[dateKey] = (counts[dateKey] ?? 0) + 1
        }
      }
      set({ monthlyActivityDates: counts })
      return
    }

    const { data } = await supabase
      .from('activities')
      .select('recorded_at')
      .eq('family_id', familyId)
      .gte('recorded_at', startOfMonth.toISOString())
      .lte('recorded_at', endOfMonth.toISOString())

    const counts: Record<string, number> = {}
    if (data) {
      for (const row of data as { recorded_at: string }[]) {
        const dateKey = row.recorded_at.slice(0, 10)
        counts[dateKey] = (counts[dateKey] ?? 0) + 1
      }
    }

    set({ monthlyActivityDates: counts })
  },

  recordActivity: async ({ familyId, deviceId, type, recordedAt, metadata, memo }) => {
    if (useDemoStore.getState().isDemo) {
      const newActivity: Activity = {
        id: `demo-new-${Date.now()}`,
        family_id: familyId,
        device_id: deviceId,
        type,
        recorded_at: recordedAt,
        memo: memo || null,
        metadata,
        created_at: new Date().toISOString(),
      }
      set((state) => ({
        _allDemoActivities: [...state._allDemoActivities, newActivity]
          .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()),
      }))
      // Refresh current view
      const selectedDate = get().selectedDate
      await get().fetchActivities(familyId, selectedDate)
      await get().fetchRecentActivities(familyId)
      return
    }

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
    if (useDemoStore.getState().isDemo) {
      set((state) => ({
        _allDemoActivities: state._allDemoActivities.map((a) =>
          a.id === activityId ? { ...a, recorded_at: recordedAt, metadata } : a,
        ),
        activities: state.activities
          .map((a) => (a.id === activityId ? { ...a, recorded_at: recordedAt, metadata } : a))
          .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()),
        recentActivities: state.recentActivities
          .map((a) => (a.id === activityId ? { ...a, recorded_at: recordedAt, metadata } : a))
          .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()),
      }))
      return
    }

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
    if (useDemoStore.getState().isDemo) {
      set((state) => ({
        _allDemoActivities: state._allDemoActivities.filter((a) => a.id !== activityId),
        activities: state.activities.filter((a) => a.id !== activityId),
        recentActivities: state.recentActivities.filter((a) => a.id !== activityId),
      }))
      return
    }

    const prev = { activities: get().activities, recentActivities: get().recentActivities }
    set((state) => ({
      activities: state.activities.filter((a) => a.id !== activityId),
      recentActivities: state.recentActivities.filter((a) => a.id !== activityId),
    }))

    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', activityId)

    if (error) {
      set({ activities: prev.activities, recentActivities: prev.recentActivities })
      throw new Error('활동 삭제에 실패했습니다.')
    }
  },

  subscribe: (familyId: string) => {
    if (useDemoStore.getState().isDemo) return

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
            set((state) => {
              const list = state.activities
              const newTime = activityDate.getTime()
              // Binary search for insertion index (ascending order)
              let lo = 0
              let hi = list.length
              while (lo < hi) {
                const mid = (lo + hi) >>> 1
                if (new Date(list[mid].recorded_at).getTime() < newTime) {
                  lo = mid + 1
                } else {
                  hi = mid
                }
              }
              const next = [...list]
              next.splice(lo, 0, newActivity)
              return { activities: next }
            })
          }
          // Update recentActivities
          set((state) => {
            const updated = [newActivity, ...state.recentActivities]
              .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())
              .slice(0, 5)
            return { recentActivities: updated }
          })
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
              .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()),
            recentActivities: state.recentActivities
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
            recentActivities: state.recentActivities.filter((a) => a.id !== deleted.id),
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
