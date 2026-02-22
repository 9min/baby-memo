import { describe, it, expect, beforeEach } from 'vitest'
import { useDemoStore } from '@/stores/demoStore'

describe('demoStore', () => {
  beforeEach(() => {
    useDemoStore.setState({ isDemo: false })
  })

  it('기본값은 isDemo === false', () => {
    expect(useDemoStore.getState().isDemo).toBe(false)
  })

  it('enterDemo()로 isDemo가 true가 된다', () => {
    useDemoStore.getState().enterDemo()
    expect(useDemoStore.getState().isDemo).toBe(true)
  })

  it('exitDemo()로 isDemo가 false로 돌아간다', () => {
    useDemoStore.getState().enterDemo()
    expect(useDemoStore.getState().isDemo).toBe(true)
    useDemoStore.getState().exitDemo()
    expect(useDemoStore.getState().isDemo).toBe(false)
  })
})
