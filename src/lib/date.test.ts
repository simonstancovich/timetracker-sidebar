import { describe, it, expect } from 'vitest'
import { formatLocalDate, mondayOf, parseTaskDate } from './date'

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

describe('mondayOf', () => {
  it('returns the same date when called on a Monday', () => {
    // Apr 20 2026 is a Monday
    const mon = mondayOf(new Date(2026, 3, 20, 14, 12))
    expect(formatLocalDate(mon)).toBe('2026-04-20')
    expect(mon.getHours()).toBe(0)
  })

  it('steps back to Monday from mid-week', () => {
    // Apr 23 2026 is a Thursday
    const mon = mondayOf(new Date(2026, 3, 23))
    expect(formatLocalDate(mon)).toBe('2026-04-20')
  })

  it('steps back to Monday from Sunday (treats Mon as start of week)', () => {
    // Apr 26 2026 is a Sunday
    const mon = mondayOf(new Date(2026, 3, 26))
    expect(formatLocalDate(mon)).toBe('2026-04-20')
  })

  it('zeroes the time-of-day', () => {
    const mon = mondayOf(new Date(2026, 3, 22, 17, 45, 12))
    expect(mon.getHours()).toBe(0)
    expect(mon.getMinutes()).toBe(0)
    expect(mon.getSeconds()).toBe(0)
    expect(mon.getMilliseconds()).toBe(0)
  })

  it('does not mutate its argument', () => {
    const input = new Date(2026, 3, 23, 14)
    const copy = new Date(input)
    mondayOf(input)
    expect(+input).toBe(+copy)
  })
})

describe('parseTaskDate', () => {
  it('parses the server "YYYY-MM-DD HH:MM:SS" shape into a local-time Date at 00:00', () => {
    const d = parseTaskDate('2026-06-02 00:00:00')
    expect(d).not.toBeNull()
    expect(formatLocalDate(d!)).toBe('2026-06-02')
    expect(d!.getHours()).toBe(0)
  })

  it('parses a bare "YYYY-MM-DD" the same way', () => {
    expect(formatLocalDate(parseTaskDate('2026-01-15')!)).toBe('2026-01-15')
  })

  it('returns null for empty / non-string / malformed input', () => {
    expect(parseTaskDate('')).toBeNull()
    expect(parseTaskDate(null)).toBeNull()
    expect(parseTaskDate(undefined)).toBeNull()
    expect(parseTaskDate('not a date')).toBeNull()
    expect(parseTaskDate('06-02-2026')).toBeNull()
  })

  it('regression — does not roll an edit of yesterday onto today (the split-on-"-" bug)', () => {
    // The old code did `task_date.split("-").map(Number)` which left the day
    // chunk as "02 00:00:00", making it NaN and silently falling back to today.
    const parsed = parseTaskDate('2026-06-02 00:00:00')!
    expect(formatLocalDate(parsed)).toBe('2026-06-02')
  })
})
