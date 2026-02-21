import { useFamilyStore } from '@/stores/familyStore'
import { useActivityStore } from '@/stores/activityStore'
import { useDefaultsStore } from '@/stores/defaultsStore'
import { useSupplementStore } from '@/stores/supplementStore'
import { useStatsStore } from '@/stores/statsStore'
import { useBabyStore } from '@/stores/babyStore'
import { useThemeStore } from '@/stores/themeStore'
import { getDateRange } from '@/lib/statsUtils'

export function resetAllStores() {
  useFamilyStore.setState({
    familyId: null,
    familyCode: null,
    familyPassword: null,
    deviceId: 'test-device-uuid-1234',
    initialized: false,
  })

  useActivityStore.setState({
    activities: [],
    loading: false,
    selectedDate: new Date(),
    channel: null,
  })

  useDefaultsStore.setState({
    defaultsByFamily: {},
  })

  useSupplementStore.setState({
    presets: [],
    loading: false,
    channel: null,
  })

  useBabyStore.setState({
    babies: [],
    loading: false,
    channel: null,
  })

  useThemeStore.setState({
    theme: 'system',
  })

  const now = new Date()
  useStatsStore.setState({
    period: 'daily',
    anchorDate: now,
    dateRange: getDateRange('daily', now),
    rawActivities: [],
    activityCounts: [],
    drinkIntakes: [],
    sleepDurations: [],
    loading: false,
  })
}

export function setFamilyState(overrides: Partial<ReturnType<typeof useFamilyStore.getState>>) {
  useFamilyStore.setState(overrides)
}

export function setActivityState(overrides: Partial<ReturnType<typeof useActivityStore.getState>>) {
  useActivityStore.setState(overrides)
}

export function setSupplementState(overrides: Partial<ReturnType<typeof useSupplementStore.getState>>) {
  useSupplementStore.setState(overrides)
}
