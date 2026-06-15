import { vars } from "../theme";

const GOAL = 8;

export type AchTone = "milestone" | "streak" | "hours" | "time";

// Achievement accent mapped onto the brand token ramp (not ad-hoc hex) so the
// unlocked grid reads as one collection and themes with light/dark.
export const ACH_TONE_COLOR: Record<AchTone, string> = {
  milestone: vars.typography.accent,
  streak: vars.typography.pink,
  hours: vars.typography.green,
  time: vars.typography.warning,
};

export const ACHS = [
  // First-time milestones
  { id: "first", e: "🎯", xp: 50, tone: "milestone" },
  { id: "rookie", e: "📋", xp: 75, tone: "milestone" },
  { id: "novice", e: "📝", xp: 150, tone: "milestone" },
  { id: "veteran", e: "🎖️", xp: 250, tone: "milestone" },
  { id: "prolific", e: "📚", xp: 750, tone: "milestone" },

  // Streaks
  { id: "warmup", e: "☕", xp: 50, tone: "streak" },
  { id: "fire", e: "🔥", xp: 100, tone: "streak" },
  { id: "habit", e: "🔗", xp: 175, tone: "streak" },
  { id: "lockin", e: "🔒", xp: 300, tone: "streak" },
  { id: "disciplined", e: "🧘", xp: 500, tone: "streak" },
  { id: "obsessed", e: "⚡", xp: 800, tone: "streak" },
  { id: "unstoppable", e: "🚀", xp: 1200, tone: "streak" },
  { id: "legend", e: "👑", xp: 2500, tone: "streak" },

  // Hours accumulated
  { id: "quarter", e: "🌱", xp: 100, tone: "hours" },
  { id: "flow", e: "🌊", xp: 150, tone: "hours" },
  { id: "cent", e: "💯", xp: 300, tone: "hours" },
  { id: "dedicated", e: "💪", xp: 500, tone: "hours" },
  { id: "halfgrand", e: "🏅", xp: 750, tone: "hours" },
  { id: "grand", e: "🏆", xp: 1250, tone: "hours" },
  { id: "mythic", e: "💎", xp: 2500, tone: "hours" },
  { id: "legacy", e: "🗿", xp: 5000, tone: "hours" },

  // Daily peaks
  { id: "solid", e: "📈", xp: 50, tone: "hours" },
  { id: "full", e: "✅", xp: 80, tone: "hours" },
  { id: "goal", e: "⭐", xp: 120, tone: "hours" },
  { id: "lord", e: "⏰", xp: 175, tone: "hours" },
  { id: "midnight", e: "🌙", xp: 275, tone: "hours" },
  { id: "impossible", e: "🤯", xp: 500, tone: "hours" },

  // Time of day
  { id: "early", e: "🌅", xp: 75, tone: "time" },
  { id: "dawn", e: "🌄", xp: 150, tone: "time" },
  { id: "night", e: "🦉", xp: 75, tone: "time" },
  { id: "vampire", e: "🦇", xp: 125, tone: "time" },
  { id: "twilight", e: "🌇", xp: 40, tone: "time" },
  { id: "lunch", e: "🥪", xp: 50, tone: "time" },

  // Variety
  { id: "multi", e: "🎭", xp: 100, tone: "milestone" },
  { id: "collector", e: "🗂️", xp: 250, tone: "milestone" },
  { id: "hopper", e: "🐸", xp: 125, tone: "milestone" },
  { id: "renaissance", e: "🎨", xp: 400, tone: "milestone" },
  { id: "focused", e: "🎯", xp: 100, tone: "milestone" },

  // Weekly / monthly
  { id: "perfectweek", e: "🌟", xp: 350, tone: "streak" },
  { id: "perfectmonth", e: "✨", xp: 1500, tone: "streak" },
  { id: "king", e: "♛", xp: 1000, tone: "streak" },
  { id: "comeback", e: "💫", xp: 75, tone: "streak" },
  { id: "weekend", e: "🌴", xp: 60, tone: "streak" },
  { id: "break", e: "🏖️", xp: 25, tone: "streak" },

  // Billing
  { id: "firstinv", e: "💰", xp: 50, tone: "hours" },
  { id: "bigweek", e: "💵", xp: 300, tone: "hours" },
  { id: "moneymaker", e: "💸", xp: 1750, tone: "hours" },

  // Quirky
  { id: "speed", e: "⚡", xp: 80, tone: "time" },
  { id: "overachiever", e: "🔥", xp: 600, tone: "time" },
  { id: "editor", e: "✏️", xp: 50, tone: "time" },
] as const;
export type Ach = (typeof ACHS)[number];

export type AchStats = {
  entriesCount: number;
  totalH: number;
  totalBillableH: number;
  clientIds: string[];
  projectIds: string[];
  currentWeekKey: string;
  currentWeekBillableH: number;
};

export const EMPTY_ACH_STATS: AchStats = {
  entriesCount: 0,
  totalH: 0,
  totalBillableH: 0,
  clientIds: [],
  projectIds: [],
  currentWeekKey: "",
  currentWeekBillableH: 0,
};

export type AchCtx = {
  stats: AchStats;
  streak: number;
  todayH: number;
  clientsToday: number;
  projectsToday: number;
  hourOfDay: number;
  daysSinceLastLog: number;
  savedIsWeekend: boolean;
  savedIsToday: boolean;
  entryIsBillable: boolean;
  entryHours: number;
  weekDaysAtGoal: number;
};

// Predicate table — returns true when the achievement's condition is met.
// Entries not listed (perfectmonth, king, overachiever, speed, editor) require
// richer historical data than we currently track; they stay locked until we
// add the history backing.
export const CHECKS: Record<string, (c: AchCtx) => boolean> = {
  first: (c) => c.stats.entriesCount >= 1,
  rookie: (c) => c.stats.entriesCount >= 10,
  novice: (c) => c.stats.entriesCount >= 50,
  veteran: (c) => c.stats.entriesCount >= 100,
  prolific: (c) => c.stats.entriesCount >= 500,

  warmup: (c) => c.streak >= 3,
  fire: (c) => c.streak >= 7,
  habit: (c) => c.streak >= 14,
  lockin: (c) => c.streak >= 30,
  disciplined: (c) => c.streak >= 60,
  obsessed: (c) => c.streak >= 100,
  unstoppable: (c) => c.streak >= 200,
  legend: (c) => c.streak >= 365,

  quarter: (c) => c.stats.totalH >= 25,
  flow: (c) => c.stats.totalH >= 50,
  cent: (c) => c.stats.totalH >= 100,
  dedicated: (c) => c.stats.totalH >= 250,
  halfgrand: (c) => c.stats.totalH >= 500,
  grand: (c) => c.stats.totalH >= 1000,
  mythic: (c) => c.stats.totalH >= 2500,
  legacy: (c) => c.stats.totalH >= 5000,

  solid: (c) => c.savedIsToday && c.todayH >= 4,
  full: (c) => c.savedIsToday && c.todayH >= 6,
  goal: (c) => c.savedIsToday && c.todayH >= GOAL,
  lord: (c) => c.savedIsToday && c.todayH >= 10,
  midnight: (c) => c.savedIsToday && c.todayH >= 12,
  impossible: (c) => c.savedIsToday && c.todayH >= 16,

  early: (c) => c.hourOfDay < 9,
  dawn: (c) => c.hourOfDay < 6,
  night: (c) => c.hourOfDay >= 22,
  vampire: (c) => c.hourOfDay >= 0 && c.hourOfDay < 4,
  twilight: (c) => c.hourOfDay >= 18 && c.hourOfDay < 22,
  lunch: (c) => c.hourOfDay === 12,

  multi: (c) => c.savedIsToday && c.clientsToday >= 3,
  collector: (c) => c.stats.clientIds.length >= 10,
  hopper: (c) => c.savedIsToday && c.projectsToday >= 5,
  renaissance: (c) => c.stats.projectIds.length >= 20,
  focused: (c) => c.savedIsToday && c.projectsToday === 1 && c.todayH >= GOAL,

  perfectweek: (c) => c.weekDaysAtGoal >= 5,
  comeback: (c) => c.daysSinceLastLog >= 7,
  weekend: (c) => c.savedIsWeekend,
  break: (c) => c.daysSinceLastLog >= 7,

  firstinv: (c) => c.stats.totalBillableH > 0,
  bigweek: (c) => c.stats.currentWeekBillableH >= 40,
  moneymaker: (c) => c.stats.totalBillableH >= 1000,
};

export const isoWeekKey = (d: Date): string => {
  const x = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = x.getUTCDay() || 7;
  x.setUTCDate(x.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(x.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((+x - +yearStart) / 86400000 + 1) / 7);
  return `${x.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
};

interface SaveDelta {
  hours: number;
  invoice: boolean;
  cid: string;
  prid: string;
  weekKey: string;
}

// Fold a freshly-saved entry into the running achievement-stats snapshot.
// Pure — no React, no I/O. Client / project ids dedupe; the weekly billable
// total resets if the entry is the first one in a new ISO week.
export function nextAchStats(prev: AchStats, delta: SaveDelta): AchStats {
  return {
    entriesCount: prev.entriesCount + 1,
    totalH: +(prev.totalH + delta.hours).toFixed(2),
    totalBillableH: +(
      prev.totalBillableH + (delta.invoice ? delta.hours : 0)
    ).toFixed(2),
    clientIds: prev.clientIds.includes(delta.cid)
      ? prev.clientIds
      : [...prev.clientIds, delta.cid],
    projectIds: prev.projectIds.includes(delta.prid)
      ? prev.projectIds
      : [...prev.projectIds, delta.prid],
    currentWeekKey: delta.weekKey,
    currentWeekBillableH: +(
      (prev.currentWeekKey === delta.weekKey ? prev.currentWeekBillableH : 0) +
      (delta.invoice ? delta.hours : 0)
    ).toFixed(2),
  };
}

// Find achievements whose predicates pass against `ctx` and aren't already in
// `unlocked`. Order matches the ACHS list.
export function findNewlyUnlocked(unlocked: string[], ctx: AchCtx): Ach[] {
  const out: Ach[] = [];
  for (const a of ACHS) {
    if (unlocked.includes(a.id)) continue;
    const fn = CHECKS[a.id];
    if (fn && fn(ctx)) out.push(a);
  }
  return out;
}
