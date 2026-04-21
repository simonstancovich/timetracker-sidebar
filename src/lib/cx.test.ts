import { describe, it, expect } from 'vitest'
import { cx } from './cx'

describe('cx', () => {
  it('joins truthy strings with a single space', () => {
    expect(cx('a', 'b', 'c')).toBe('a b c')
  })

  it('drops falsy entries (false, null, undefined, empty string)', () => {
    expect(cx('a', false, 'b', null, 'c', undefined, 'd', '')).toBe('a b c d')
  })

  it('handles all-falsy input as an empty string', () => {
    expect(cx(false, null, undefined)).toBe('')
  })

  it('supports conditional class patterns', () => {
    const active = true
    const disabled = false
    expect(cx('btn', active && 'btn-active', disabled && 'btn-disabled')).toBe('btn btn-active')
  })

  it('accepts no arguments', () => {
    expect(cx()).toBe('')
  })
})
