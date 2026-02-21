import { describe, it, expect } from 'vitest'
import { APP_NAME, FAMILY_CODE_KEY, MIN_CODE_LENGTH, MAX_CODE_LENGTH } from './constants'

describe('constants', () => {
  it('APP_NAME is Baby Memo', () => {
    expect(APP_NAME).toBe('Baby Memo')
  })

  it('FAMILY_CODE_KEY is baby-memo-family-code', () => {
    expect(FAMILY_CODE_KEY).toBe('baby-memo-family-code')
  })

  it('MIN_CODE_LENGTH is 6', () => {
    expect(MIN_CODE_LENGTH).toBe(6)
  })

  it('MAX_CODE_LENGTH is 8', () => {
    expect(MAX_CODE_LENGTH).toBe(8)
  })

  it('MIN_CODE_LENGTH <= MAX_CODE_LENGTH', () => {
    expect(MIN_CODE_LENGTH).toBeLessThanOrEqual(MAX_CODE_LENGTH)
  })
})
