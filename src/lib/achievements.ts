// Achievement evaluation: stats schema + predicate table + ISO-week helper.
// Pure data + pure functions; no React, no IPC. App.tsx imports this and
// runs the predicates after each save to determine what newly unlocks.
//
// The structural achievement records (id / emoji / xp / color) live in
// App.tsx; localized name/description live in /locales. This file owns only
// the rules.

const GOAL = 8

export type AchStats = {
  entriesCount: number
  totalH: number
  totalBillableH: number
  clientIds: string[]
  projectIds: string[]
  currentWeekKey: string
  currentWeekBillableH: number
}

export const EMPTY_ACH_STATS: AchStats = {
  entriesCount: 0, totalH: 0, totalBillableH: 0,
  clientIds: [], projectIds: [],
  currentWeekKey: '', currentWeekBillableH: 0,
}

export type AchCtx = {
  stats: AchStats
  streak: number
  todayH: number
  clientsToday: number
  projectsToday: number
  hourOfDay: number
  daysSinceLastLog: number
  savedIsWeekend: boolean
  savedIsToday: boolean
  entryIsBillable: boolean
  entryHours: number
  weekDaysAtGoal: number
}

// Predicate table — returns true when the achievement's condition is met.
// Entries not listed (perfectmonth, king, overachiever, speed, editor) require
// richer historical data than we currently track; they stay locked until we
// add the history backing.
export const CHECKS: Record<string, (c: AchCtx) => boolean> = {
  first:       (c) => c.stats.entriesCount >= 1,
  rookie:      (c) => c.stats.entriesCount >= 10,
  novice:      (c) => c.stats.entriesCount >= 50,
  veteran:     (c) => c.stats.entriesCount >= 100,
  prolific:    (c) => c.stats.entriesCount >= 500,

  warmup:      (c) => c.streak >= 3,
  fire:        (c) => c.streak >= 7,
  habit:       (c) => c.streak >= 14,
  lockin:      (c) => c.streak >= 30,
  disciplined: (c) => c.streak >= 60,
  obsessed:    (c) => c.streak >= 100,
  unstoppable: (c) => c.streak >= 200,
  legend:      (c) => c.streak >= 365,

  quarter:     (c) => c.stats.totalH >= 25,
  flow:        (c) => c.stats.totalH >= 50,
  cent:        (c) => c.stats.totalH >= 100,
  dedicated:   (c) => c.stats.totalH >= 250,
  halfgrand:   (c) => c.stats.totalH >= 500,
  grand:       (c) => c.stats.totalH >= 1000,
  mythic:      (c) => c.stats.totalH >= 2500,
  legacy:      (c) => c.stats.totalH >= 5000,

  solid:       (c) => c.savedIsToday && c.todayH >= 4,
  full:        (c) => c.savedIsToday && c.todayH >= 6,
  goal:        (c) => c.savedIsToday && c.todayH >= GOAL,
  lord:        (c) => c.savedIsToday && c.todayH >= 10,
  midnight:    (c) => c.savedIsToday && c.todayH >= 12,
  impossible:  (c) => c.savedIsToday && c.todayH >= 16,

  early:       (c) => c.hourOfDay < 9,
  dawn:        (c) => c.hourOfDay < 6,
  night:       (c) => c.hourOfDay >= 22,
  vampire:     (c) => c.hourOfDay >= 0 && c.hourOfDay < 4,
  twilight:    (c) => c.hourOfDay >= 18 && c.hourOfDay < 22,
  lunch:       (c) => c.hourOfDay === 12,

  multi:       (c) => c.savedIsToday && c.clientsToday >= 3,
  collector:   (c) => c.stats.clientIds.length >= 10,
  hopper:      (c) => c.savedIsToday && c.projectsToday >= 5,
  renaissance: (c) => c.stats.projectIds.length >= 20,
  focused:     (c) => c.savedIsToday && c.projectsToday === 1 && c.todayH >= GOAL,

  perfectweek: (c) => c.weekDaysAtGoal >= 5,
  comeback:    (c) => c.daysSinceLastLog >= 7,
  weekend:     (c) => c.savedIsWeekend,
  break:       (c) => c.daysSinceLastLog >= 7,

  firstinv:    (c) => c.stats.totalBillableH > 0,
  bigweek:     (c) => c.stats.currentWeekBillableH >= 40,
  moneymaker:  (c) => c.stats.totalBillableH >= 1000,
}

export const isoWeekKey = (d: Date): string => {
  const x = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const day = x.getUTCDay() || 7
  x.setUTCDate(x.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(x.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((+x - +yearStart) / 86400000 + 1) / 7)
  return `${x.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}
