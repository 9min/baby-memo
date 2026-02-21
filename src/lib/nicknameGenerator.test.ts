import { describe, it, expect } from 'vitest'
import { generateNickname } from './nicknameGenerator'

describe('generateNickname', () => {
  it('returns a string', () => {
    const result = generateNickname()
    expect(typeof result).toBe('string')
  })

  it('returns a nickname with adjective and animal separated by space', () => {
    const result = generateNickname()
    const parts = result.split(' ')
    expect(parts.length).toBeGreaterThanOrEqual(2)
  })

  it('avoids existing nicknames', () => {
    const existing = ['귀여운 토끼']
    const results = new Set<string>()
    for (let i = 0; i < 50; i++) {
      results.add(generateNickname(existing))
    }
    expect(results.has('귀여운 토끼')).toBe(false)
  })

  it('generates different nicknames on multiple calls', () => {
    const results = new Set<string>()
    for (let i = 0; i < 20; i++) {
      results.add(generateNickname())
    }
    // Should have at least 2 different nicknames out of 20 attempts
    expect(results.size).toBeGreaterThan(1)
  })

  it('handles empty existing list', () => {
    const result = generateNickname([])
    expect(result).toBeTruthy()
  })
})
