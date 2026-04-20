import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getTimerInsight, type InsightCtx } from './timerInsights'

const baseCtx = (overrides: Partial<InsightCtx> = {}): InsightCtx => ({
  tRun: false, tSec: 0,
  tCo: 'co1', tPr: 'pr1', tD: 'work',
  todayH: 0, goal: 8,
  entriesToday: 0,
  streak: 0,
  firstName: 'Bob',
  lang: 'en',
  ...overrides,
})

describe('getTimerInsight — required-field gates', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('asks for a client when tCo is empty (mid-week morning)', () => {
    vi.setSystemTime(new Date(2026, 3, 15, 10)) // Wed 10:00
    const msg = getTimerInsight(baseCtx({ tCo: '' }))
    expect(msg).toMatch(/client|who/i)
  })

  it('asks for a project when only tCo is set', () => {
    vi.setSystemTime(new Date(2026, 3, 15, 10))
    const msg = getTimerInsight(baseCtx({ tCo: 'co1', tPr: '' }))
    expect(msg).toMatch(/project/i)
  })

  it('asks for a description when tD is blank', () => {
    vi.setSystemTime(new Date(2026, 3, 15, 10))
    const msg = getTimerInsight(baseCtx({ tD: '' }))
    expect(msg).toMatch(/description|describe|line/i)
  })

  it('returns Swedish prompts when lang=sv', () => {
    vi.setSystemTime(new Date(2026, 3, 15, 10))
    const msg = getTimerInsight(baseCtx({ tCo: '', lang: 'sv' }))
    expect(msg).toMatch(/[åäöÅÄÖ]|kund/i)
  })
})

describe('getTimerInsight — running ranges', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('responds with a fresh-start message under 3 min', () => {
    vi.setSystemTime(new Date(2026, 3, 15, 10))
    const msg = getTimerInsight(baseCtx({ tRun: true, tSec: 60 }))
    expect(msg.length).toBeGreaterThan(0)
  })

  it('responds with a deep-work message between 15–30 min', () => {
    vi.setSystemTime(new Date(2026, 3, 15, 10))
    const msg = getTimerInsight(baseCtx({ tRun: true, tSec: 20 * 60 }))
    expect(msg).toMatch(/deep|magic|territory|friction|magin|djup/i)
  })

  it('warns about long sessions past 60 min', () => {
    vi.setSystemTime(new Date(2026, 3, 15, 10))
    const msg = getTimerInsight(baseCtx({ tRun: true, tSec: 90 * 60 }))
    expect(msg).toMatch(/stretch|water|walk|blink|eyes|back|stretcha|vatten|promenad/i)
  })
})

describe('getTimerInsight — day-off branches', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('on a Saturday with no timer running, suggests resting', () => {
    vi.setSystemTime(new Date(2026, 3, 18, 10)) // Saturday
    const msg = getTimerInsight(baseCtx({ tRun: false, tCo: '', tPr: '', tD: '' }))
    expect(msg).toMatch(/saturday|weekend|lördag|helg|easy|expected|förväntas/i)
  })

  it('logging on a Saturday gets a respect message', () => {
    vi.setSystemTime(new Date(2026, 3, 18, 10))
    const msg = getTimerInsight(baseCtx({ tRun: true, tSec: 60 }))
    expect(msg).toMatch(/saturday|weekend|overtime|worth|lördag|värt|helg|övertid/i)
  })

  it('on a Swedish public holiday, mentions the holiday', () => {
    // 2026-05-01 = Första maj (Friday)
    vi.setSystemTime(new Date(2026, 4, 1, 10))
    const msg = getTimerInsight(baseCtx({ tRun: false, tCo: '', tPr: '', tD: '' }))
    expect(msg).toContain('Första maj')
  })
})

describe('getTimerInsight — goal progress', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('celebrates when goal already reached', () => {
    vi.setSystemTime(new Date(2026, 3, 15, 14)) // Wed afternoon
    // Function picks one of 5 lines; assert one of the recognizable tokens appears.
    const msg = getTimerInsight(baseCtx({ todayH: 8, entriesToday: 4 }))
    expect(msg).toMatch(/goal|crushed|bonus|frosting|hit 8|reached|house money|Take the W|krossat|mål|glasyr|husets pengar|Ta poängen/i)
  })

  it('reports near-goal when 75-99% done', () => {
    vi.setSystemTime(new Date(2026, 3, 15, 14))
    const msg = getTimerInsight(baseCtx({ todayH: 7, entriesToday: 3 }))
    expect(msg).toMatch(/from goal|nearly|push|stretch|fart|pressa|nästan|slutspurt/i)
  })
})
