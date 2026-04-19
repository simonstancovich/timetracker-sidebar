import { describe, it, expect } from 'vitest'
import { CHECKS, EMPTY_ACH_STATS, isoWeekKey, type AchCtx, type AchStats } from './achievements'

const baseStats = (overrides: Partial<AchStats> = {}): AchStats => ({
  ...EMPTY_ACH_STATS,
  ...overrides,
})

const baseCtx = (overrides: Partial<AchCtx> = {}): AchCtx => ({
  stats: baseStats(),
  streak: 0,
  todayH: 0,
  clientsToday: 0,
  projectsToday: 0,
  hourOfDay: 12,
  daysSinceLastLog: 0,
  savedIsWeekend: false,
  savedIsToday: true,
  entryIsBillable: false,
  entryHours: 0,
  weekDaysAtGoal: 0,
  ...overrides,
})

describe('CHECKS — entry-count milestones', () => {
  it('first unlocks at 1 entry', () => {
    expect(CHECKS.first(baseCtx({ stats: baseStats({ entriesCount: 0 }) }))).toBe(false)
    expect(CHECKS.first(baseCtx({ stats: baseStats({ entriesCount: 1 }) }))).toBe(true)
  })

  it('rookie/novice/veteran/prolific cross at thresholds', () => {
    expect(CHECKS.rookie(baseCtx({ stats: baseStats({ entriesCount: 9 }) }))).toBe(false)
    expect(CHECKS.rookie(baseCtx({ stats: baseStats({ entriesCount: 10 }) }))).toBe(true)
    expect(CHECKS.novice(baseCtx({ stats: baseStats({ entriesCount: 50 }) }))).toBe(true)
    expect(CHECKS.veteran(baseCtx({ stats: baseStats({ entriesCount: 100 }) }))).toBe(true)
    expect(CHECKS.prolific(baseCtx({ stats: baseStats({ entriesCount: 499 }) }))).toBe(false)
    expect(CHECKS.prolific(baseCtx({ stats: baseStats({ entriesCount: 500 }) }))).toBe(true)
  })
})

describe('CHECKS — streaks', () => {
  it('warmup at 3, fire at 7, habit at 14', () => {
    expect(CHECKS.warmup(baseCtx({ streak: 2 }))).toBe(false)
    expect(CHECKS.warmup(baseCtx({ streak: 3 }))).toBe(true)
    expect(CHECKS.fire(baseCtx({ streak: 7 }))).toBe(true)
    expect(CHECKS.habit(baseCtx({ streak: 14 }))).toBe(true)
  })

  it('legend requires 365', () => {
    expect(CHECKS.legend(baseCtx({ streak: 364 }))).toBe(false)
    expect(CHECKS.legend(baseCtx({ streak: 365 }))).toBe(true)
  })
})

describe('CHECKS — total hours', () => {
  it('tier thresholds (25, 50, 100, 250, 500, 1000, 2500, 5000)', () => {
    expect(CHECKS.quarter(baseCtx({ stats: baseStats({ totalH: 25 }) }))).toBe(true)
    expect(CHECKS.flow(baseCtx({ stats: baseStats({ totalH: 50 }) }))).toBe(true)
    expect(CHECKS.cent(baseCtx({ stats: baseStats({ totalH: 100 }) }))).toBe(true)
    expect(CHECKS.legacy(baseCtx({ stats: baseStats({ totalH: 4999 }) }))).toBe(false)
    expect(CHECKS.legacy(baseCtx({ stats: baseStats({ totalH: 5000 }) }))).toBe(true)
  })
})

describe('CHECKS — daily peaks', () => {
  it('only fire when savedIsToday is true', () => {
    // Even with todayH past threshold, savedIsToday=false means no fire.
    expect(CHECKS.solid(baseCtx({ savedIsToday: false, todayH: 10 }))).toBe(false)
    expect(CHECKS.solid(baseCtx({ savedIsToday: true, todayH: 4 }))).toBe(true)
  })

  it('progressive thresholds (4/6/8/10/12/16)', () => {
    expect(CHECKS.full(baseCtx({ todayH: 6 }))).toBe(true)
    expect(CHECKS.goal(baseCtx({ todayH: 8 }))).toBe(true)
    expect(CHECKS.lord(baseCtx({ todayH: 10 }))).toBe(true)
    expect(CHECKS.midnight(baseCtx({ todayH: 12 }))).toBe(true)
    expect(CHECKS.impossible(baseCtx({ todayH: 16 }))).toBe(true)
    expect(CHECKS.impossible(baseCtx({ todayH: 15.5 }))).toBe(false)
  })
})

describe('CHECKS — time-of-day', () => {
  it('early before 9, dawn before 6', () => {
    expect(CHECKS.early(baseCtx({ hourOfDay: 8 }))).toBe(true)
    expect(CHECKS.early(baseCtx({ hourOfDay: 9 }))).toBe(false)
    expect(CHECKS.dawn(baseCtx({ hourOfDay: 5 }))).toBe(true)
    expect(CHECKS.dawn(baseCtx({ hourOfDay: 6 }))).toBe(false)
  })

  it('night at/after 22', () => {
    expect(CHECKS.night(baseCtx({ hourOfDay: 21 }))).toBe(false)
    expect(CHECKS.night(baseCtx({ hourOfDay: 22 }))).toBe(true)
  })

  it('vampire is 0–3, twilight is 18–21', () => {
    expect(CHECKS.vampire(baseCtx({ hourOfDay: 0 }))).toBe(true)
    expect(CHECKS.vampire(baseCtx({ hourOfDay: 3 }))).toBe(true)
    expect(CHECKS.vampire(baseCtx({ hourOfDay: 4 }))).toBe(false)
    expect(CHECKS.twilight(baseCtx({ hourOfDay: 18 }))).toBe(true)
    expect(CHECKS.twilight(baseCtx({ hourOfDay: 21 }))).toBe(true)
    expect(CHECKS.twilight(baseCtx({ hourOfDay: 22 }))).toBe(false)
  })

  it('lunch is exactly hour 12', () => {
    expect(CHECKS.lunch(baseCtx({ hourOfDay: 11 }))).toBe(false)
    expect(CHECKS.lunch(baseCtx({ hourOfDay: 12 }))).toBe(true)
    expect(CHECKS.lunch(baseCtx({ hourOfDay: 13 }))).toBe(false)
  })
})

describe('CHECKS — variety', () => {
  it('multi requires 3 clients today AND savedIsToday', () => {
    expect(CHECKS.multi(baseCtx({ savedIsToday: true, clientsToday: 3 }))).toBe(true)
    expect(CHECKS.multi(baseCtx({ savedIsToday: false, clientsToday: 3 }))).toBe(false)
    expect(CHECKS.multi(baseCtx({ savedIsToday: true, clientsToday: 2 }))).toBe(false)
  })

  it('collector counts lifetime distinct clients', () => {
    const ten = ['c1','c2','c3','c4','c5','c6','c7','c8','c9','c10']
    expect(CHECKS.collector(baseCtx({ stats: baseStats({ clientIds: ten }) }))).toBe(true)
    expect(CHECKS.collector(baseCtx({ stats: baseStats({ clientIds: ten.slice(0, 9) }) }))).toBe(false)
  })

  it('focused: one project today + at goal', () => {
    expect(CHECKS.focused(baseCtx({ savedIsToday: true, projectsToday: 1, todayH: 8 }))).toBe(true)
    expect(CHECKS.focused(baseCtx({ savedIsToday: true, projectsToday: 2, todayH: 8 }))).toBe(false)
    expect(CHECKS.focused(baseCtx({ savedIsToday: true, projectsToday: 1, todayH: 7 }))).toBe(false)
  })
})

describe('CHECKS — week / break', () => {
  it('perfectweek when 5 weekdays at goal', () => {
    expect(CHECKS.perfectweek(baseCtx({ weekDaysAtGoal: 4 }))).toBe(false)
    expect(CHECKS.perfectweek(baseCtx({ weekDaysAtGoal: 5 }))).toBe(true)
  })

  it('comeback / break both fire at 7+ days since last log', () => {
    expect(CHECKS.comeback(baseCtx({ daysSinceLastLog: 6 }))).toBe(false)
    expect(CHECKS.comeback(baseCtx({ daysSinceLastLog: 7 }))).toBe(true)
    expect(CHECKS.break(baseCtx({ daysSinceLastLog: 7 }))).toBe(true)
  })

  it('weekend fires when savedIsWeekend', () => {
    expect(CHECKS.weekend(baseCtx({ savedIsWeekend: false }))).toBe(false)
    expect(CHECKS.weekend(baseCtx({ savedIsWeekend: true }))).toBe(true)
  })
})

describe('CHECKS — billing', () => {
  it('firstinv on any positive billable hours', () => {
    expect(CHECKS.firstinv(baseCtx({ stats: baseStats({ totalBillableH: 0 }) }))).toBe(false)
    expect(CHECKS.firstinv(baseCtx({ stats: baseStats({ totalBillableH: 0.5 }) }))).toBe(true)
  })

  it('bigweek requires 40+ billable in current week', () => {
    expect(CHECKS.bigweek(baseCtx({ stats: baseStats({ currentWeekBillableH: 39.5 }) }))).toBe(false)
    expect(CHECKS.bigweek(baseCtx({ stats: baseStats({ currentWeekBillableH: 40 }) }))).toBe(true)
  })

  it('moneymaker at 1000 lifetime billable', () => {
    expect(CHECKS.moneymaker(baseCtx({ stats: baseStats({ totalBillableH: 999 }) }))).toBe(false)
    expect(CHECKS.moneymaker(baseCtx({ stats: baseStats({ totalBillableH: 1000 }) }))).toBe(true)
  })
})

describe('isoWeekKey', () => {
  it('produces YYYY-Www format', () => {
    expect(isoWeekKey(new Date(2026, 0, 1))).toMatch(/^\d{4}-W\d{2}$/)
  })

  it('a Monday and the following Sunday are in the same week', () => {
    const mon = new Date(2026, 3, 13) // Monday
    const sun = new Date(2026, 3, 19) // Sunday
    expect(isoWeekKey(mon)).toBe(isoWeekKey(sun))
  })

  it('a Sunday and the following Monday are in different weeks', () => {
    const sun = new Date(2026, 3, 19) // Sunday
    const mon = new Date(2026, 3, 20) // Monday
    expect(isoWeekKey(sun)).not.toBe(isoWeekKey(mon))
  })

  it('week 1 belongs to the year that contains the first Thursday', () => {
    // 2026-01-01 is a Thursday → week 1 of 2026
    expect(isoWeekKey(new Date(2026, 0, 1))).toBe('2026-W01')
  })
})
