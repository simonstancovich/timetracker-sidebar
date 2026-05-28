const GOAL = 8;

export const ACHS = [
  // First-time milestones
  { id: "first", e: "🎯", xp: 50, co: "#7c3aed" },
  { id: "rookie", e: "📋", xp: 75, co: "#8b5cf6" },
  { id: "novice", e: "📝", xp: 150, co: "#6366f1" },
  { id: "veteran", e: "🎖️", xp: 250, co: "#4f46e5" },
  { id: "prolific", e: "📚", xp: 750, co: "#3730a3" },

  // Streaks
  { id: "warmup", e: "☕", xp: 50, co: "#f97316" },
  { id: "fire", e: "🔥", xp: 100, co: "#ea580c" },
  { id: "habit", e: "🔗", xp: 175, co: "#dc2626" },
  { id: "lockin", e: "🔒", xp: 300, co: "#b91c1c" },
  { id: "disciplined", e: "🧘", xp: 500, co: "#991b1b" },
  { id: "obsessed", e: "⚡", xp: 800, co: "#eab308" },
  { id: "unstoppable", e: "🚀", xp: 1200, co: "#ca8a04" },
  { id: "legend", e: "👑", xp: 2500, co: "#a16207" },

  // Hours accumulated
  { id: "quarter", e: "🌱", xp: 100, co: "#22c55e" },
  { id: "flow", e: "🌊", xp: 150, co: "#0ea5e9" },
  { id: "cent", e: "💯", xp: 300, co: "#0891b2" },
  { id: "dedicated", e: "💪", xp: 500, co: "#0e7490" },
  { id: "halfgrand", e: "🏅", xp: 750, co: "#155e75" },
  { id: "grand", e: "🏆", xp: 1250, co: "#be185d" },
  { id: "mythic", e: "💎", xp: 2500, co: "#9f1239" },
  { id: "legacy", e: "🗿", xp: 5000, co: "#881337" },

  // Daily peaks
  { id: "solid", e: "📈", xp: 50, co: "#14b8a6" },
  { id: "full", e: "✅", xp: 80, co: "#059669" },
  { id: "goal", e: "⭐", xp: 120, co: "#16a34a" },
  { id: "lord", e: "⏰", xp: 175, co: "#15803d" },
  { id: "midnight", e: "🌙", xp: 275, co: "#166534" },
  { id: "impossible", e: "🤯", xp: 500, co: "#14532d" },

  // Time of day
  { id: "early", e: "🌅", xp: 75, co: "#f59e0b" },
  { id: "dawn", e: "🌄", xp: 150, co: "#d97706" },
  { id: "night", e: "🦉", xp: 75, co: "#6366f1" },
  { id: "vampire", e: "🦇", xp: 125, co: "#4f46e5" },
  { id: "twilight", e: "🌇", xp: 40, co: "#c026d3" },
  { id: "lunch", e: "🥪", xp: 50, co: "#db2777" },

  // Variety
  { id: "multi", e: "🎭", xp: 100, co: "#9333ea" },
  { id: "collector", e: "🗂️", xp: 250, co: "#7e22ce" },
  { id: "hopper", e: "🐸", xp: 125, co: "#6b21a8" },
  { id: "renaissance", e: "🎨", xp: 400, co: "#581c87" },
  { id: "focused", e: "🎯", xp: 100, co: "#0d9488" },

  // Weekly / monthly
  { id: "perfectweek", e: "🌟", xp: 350, co: "#fbbf24" },
  { id: "perfectmonth", e: "✨", xp: 1500, co: "#f59e0b" },
  { id: "king", e: "♛", xp: 1000, co: "#d97706" },
  { id: "comeback", e: "💫", xp: 75, co: "#06b6d4" },
  { id: "weekend", e: "🌴", xp: 60, co: "#10b981" },
  { id: "break", e: "🏖️", xp: 25, co: "#22d3ee" },

  // Billing
  { id: "firstinv", e: "💰", xp: 50, co: "#84cc16" },
  { id: "bigweek", e: "💵", xp: 300, co: "#65a30d" },
  { id: "moneymaker", e: "💸", xp: 1750, co: "#4d7c0f" },

  // Quirky
  { id: "speed", e: "⚡", xp: 80, co: "#a855f7" },
  { id: "overachiever", e: "🔥", xp: 600, co: "#ef4444" },
  { id: "editor", e: "✏️", xp: 50, co: "#64748b" },
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
