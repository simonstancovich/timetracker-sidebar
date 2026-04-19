import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  emptyTodayMessage,
  saveCheer,
  timerStartCheer,
  timerStopCheer,
  xpCoachNote,
  weekInsight,
  monthInsight,
} from './personality'

describe('emptyTodayMessage', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('returns a non-empty string for each time-of-day bucket (EN)', () => {
    for (const hour of [6, 12, 18, 23]) {
      vi.setSystemTime(new Date(2026, 3, 15, hour))
      const msg = emptyTodayMessage('en')
      expect(typeof msg).toBe('string')
      expect(msg.length).toBeGreaterThan(0)
    }
  })

  it('returns Swedish strings when lang=sv', () => {
    vi.setSystemTime(new Date(2026, 3, 15, 9))
    const msg = emptyTodayMessage('sv')
    // Swedish-specific characters are a strong proxy.
    expect(msg).toMatch(/[åäöÅÄÖ]/)
  })
})

describe('saveCheer / timerStartCheer / timerStopCheer', () => {
  it('return non-empty strings for both languages', () => {
    expect(saveCheer('en').length).toBeGreaterThan(0)
    expect(saveCheer('sv').length).toBeGreaterThan(0)
    expect(timerStartCheer('en').length).toBeGreaterThan(0)
    expect(timerStartCheer('sv').length).toBeGreaterThan(0)
    expect(timerStopCheer('en').length).toBeGreaterThan(0)
    expect(timerStopCheer('sv').length).toBeGreaterThan(0)
  })
})

describe('xpCoachNote', () => {
  const base = {
    xp: 0, xpIntoLevel: 0, xpPerLevel: 1000,
    streak: 0, weekTotal: 0, firstName: 'Bob',
  }

  it('mentions XP-to-next when within 50 of leveling up', () => {
    const msg = xpCoachNote({ ...base, xpIntoLevel: 970, xpPerLevel: 1000, lang: 'en' })
    expect(msg).toMatch(/30 XP|level up/i)
  })

  it('uses Swedish strings when lang=sv', () => {
    const msg = xpCoachNote({ ...base, xpIntoLevel: 970, xpPerLevel: 1000, lang: 'sv' })
    expect(msg).toMatch(/XP/)
    // "30 XP till nästa nivå" or "30 XP från nästa nivå"
    expect(msg).toMatch(/nivå|nästa/i)
  })

  it('falls back when no level progress and no streak hit', () => {
    const msg = xpCoachNote({ ...base, lang: 'en' })
    expect(typeof msg).toBe('string')
    expect(msg.length).toBeGreaterThan(0)
  })

  it('mentions a long streak when streak >= 7', () => {
    const msg = xpCoachNote({ ...base, streak: 14, lang: 'en' })
    expect(msg).toContain('14')
  })
})

describe('weekInsight', () => {
  const base = {
    weekTotal: 0, weeklyGoal: 40, hit: 0, workDayCount: 5, billable: 0,
    prevWeekTotal: null as number | null,
    bestDayName: null as string | null, bestDayHours: 0,
    topClientName: undefined as string | undefined, topClientShare: undefined as number | undefined,
    firstName: 'Bob', isFinished: false,
  }

  it('handles a blank week', () => {
    const msg = weekInsight({ ...base, weekTotal: 0, lang: 'en' })
    expect(msg.length).toBeGreaterThan(0)
  })

  it('reports week-over-week growth when 10%+ ahead', () => {
    const msg = weekInsight({ ...base, weekTotal: 30, prevWeekTotal: 20, lang: 'en' })
    expect(msg).toMatch(/last week|growth|ahead|momentum/i)
  })

  it('reports a clean sweep when hit==workDayCount', () => {
    const msg = weekInsight({ ...base, weekTotal: 40, hit: 5, workDayCount: 5, lang: 'en' })
    expect(msg).toMatch(/clean|goal|immaculate|every|rare/i)
  })

  it('returns Swedish text on lang=sv', () => {
    const msg = weekInsight({ ...base, weekTotal: 30, lang: 'sv' })
    expect(msg.length).toBeGreaterThan(0)
  })
})

describe('monthInsight', () => {
  const base = {
    monthTotal: 0, prevMonthTotal: null as number | null,
    hit: 0, workDayCount: 20, billable: 0,
    bestWeekLabel: undefined as string | undefined, bestWeekHours: 0,
    topClientName: undefined as string | undefined, topClientShare: undefined as number | undefined,
    firstName: 'Bob', isFinished: false,
  }

  it('handles an empty month', () => {
    const msg = monthInsight({ ...base, lang: 'en' })
    expect(msg.length).toBeGreaterThan(0)
  })

  it('reports a heavy billable month over 80h', () => {
    // Need hit/workDayCount in mid-range so the "hit rate low" branch
    // doesn't shadow the billable branch.
    const msg = monthInsight({ ...base, monthTotal: 100, billable: 90, hit: 10, lang: 'en' })
    expect(msg).toMatch(/billable|invoice/i)
  })

  it('returns Swedish text on lang=sv', () => {
    const msg = monthInsight({ ...base, monthTotal: 80, lang: 'sv' })
    expect(msg.length).toBeGreaterThan(0)
  })
})
