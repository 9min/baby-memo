import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes with clsx', () => {
    const isHidden = false
    expect(cn('base', isHidden && 'hidden', 'visible')).toBe('base visible')
  })

  it('resolves Tailwind conflicts with tailwind-merge', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('handles undefined and null values', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
  })

  it('handles empty input', () => {
    expect(cn()).toBe('')
  })

  it('handles array of classes', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
  })

  it('merges conflicting Tailwind responsive classes correctly', () => {
    expect(cn('text-sm', 'text-lg')).toBe('text-lg')
  })
})
