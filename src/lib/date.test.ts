import { describe, it, expect } from 'vitest'
import { formatLocalDate } from './date'

describe('formatLocalDate', () => {
  it('formats a date as YYYY-MM-DD using local components', () => {
    expect(formatLocalDate(new Date(2026, 0, 1))).toBe('2026-01-01')
    expect(formatLocalDate(new Date(2026, 11, 31))).toBe('2026-12-31')
  })

  it('zero-pads single-digit months and days', () => {
    expect(formatLocalDate(new Date(2026, 3, 5))).toBe('2026-04-05')
    expect(formatLocalDate(new Date(2026, 8, 9))).toBe('2026-09-09')
  })

  it('uses local time, not UTC, so the date never drifts a day across timezones', () => {
    // 23:30 local on April 19 must format as April 19, not April 20 (UTC).
    const d = new Date(2026, 3, 19, 23, 30)
    expect(formatLocalDate(d)).toBe('2026-04-19')
  })
})
