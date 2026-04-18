// Small collection of contextual micro-copy for various moments.
// Keep messages tight and warm — one line at a time.

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]

// ─── Empty Today state — no entries logged yet ───────────────────────
const EMPTY_TODAY_MORNING = [
  'Empty slate. What\'s the first move?',
  'No entries yet — start the timer and log your first task.',
  'Morning. Nothing tracked yet. Change that.',
  'Clean slate. The best hours haven\'t been logged yet.',
  'Zero entries. Zero excuses.',
]
const EMPTY_TODAY_MIDDAY = [
  'No entries yet today — time to catch up.',
  'The day is slipping. Log something real.',
  'Empty log. Let\'s fix that in the next hour.',
  'Still 0:00. You\'ve got the afternoon to make it count.',
]
const EMPTY_TODAY_EVENING = [
  'No entries today. Still time to log something.',
  'Late start is still a start.',
  'One entry is still better than zero.',
  'The day isn\'t done until you log it.',
]
const EMPTY_TODAY_NIGHT = [
  'Late night, no entries. Respect — also, log it.',
  'Night owl mode. Log what you did.',
  'Still awake? Still time to log.',
]

export function emptyTodayMessage(): string {
  const h = new Date().getHours()
  if (h < 10) return pick(EMPTY_TODAY_MORNING)
  if (h < 16) return pick(EMPTY_TODAY_MIDDAY)
  if (h < 21) return pick(EMPTY_TODAY_EVENING)
  return pick(EMPTY_TODAY_NIGHT)
}

// ─── Save confirmations — cheerful ───────────────────────────────────
const SAVE_PREFIX = [
  'Nice.',
  'Locked in.',
  'Logged.',
  'Got it.',
  'Clocked.',
  'In the books.',
  'Tracked.',
  'Solid.',
  'Nailed.',
  'Stored.',
  'On the record.',
]

export function saveCheer(): string {
  return pick(SAVE_PREFIX)
}

// ─── XP tab coach note — based on level progress ─────────────────────
export function xpCoachNote(ctx: {
  xp: number
  xpIntoLevel: number
  xpPerLevel: number
  streak: number
  weekTotal: number
  firstName?: string
}): string {
  const { xpIntoLevel, xpPerLevel, streak, weekTotal, firstName } = ctx
  const name = firstName || 'you'
  const remaining = xpPerLevel - xpIntoLevel
  const pct = (xpIntoLevel / xpPerLevel) * 100

  // Very close to level up
  if (remaining <= 50) return pick([
    `Only ${remaining} XP to the next level. So close.`,
    `${remaining} XP away from level up. One more session.`,
    `Push through — ${remaining} XP to level up.`,
  ])

  // Close
  if (pct >= 75) return pick([
    `${pct.toFixed(0)}% of the way to the next level.`,
    `You're in the final stretch — ${remaining} XP to go.`,
    `Almost there, ${name}. ${remaining} XP left.`,
  ])

  // Mid
  if (pct >= 40) return pick([
    `Halfway-ish. Keep logging, ${name}.`,
    `${pct.toFixed(0)}% to level ${Math.floor(ctx.xp / ctx.xpPerLevel) + 2}.`,
    'Every hour tracked adds up. Keep going.',
  ])

  // Low progress
  if (xpIntoLevel > 0) return pick([
    'Fresh level — plenty of room to grow.',
    `Starting out at a new level. Keep the streak going.`,
    `${remaining} XP to the next milestone.`,
  ])

  // Bonus messages based on weekly / streak
  if (streak >= 7) return `${streak}-day streak — XP is compounding.`
  if (weekTotal >= 30) return `Strong week so far — ${weekTotal.toFixed(1)}h logged.`
  return pick([
    'XP builds quietly. Keep showing up.',
    'Level ups are a byproduct of consistency.',
    'Every minute tracked = +1 XP. It adds up.',
  ])
}

// ─── Timer start / stop flavor ───────────────────────────────────────
const TIMER_START = [
  'Focus time.',
  'Game on.',
  'Here we go.',
  'Clock rolling.',
  'Eyes on the task.',
  'Tracker\'s ticking.',
]
const TIMER_STOP = [
  'Clocked out.',
  'Solid session.',
  'In the books.',
  'Session saved.',
  'Nice work.',
]

export function timerStartCheer(): string { return pick(TIMER_START) }
export function timerStopCheer(): string { return pick(TIMER_STOP) }

// ─── Monthly coach summary ────────────────────────────────────────────
export function monthInsight(ctx: {
  monthTotal: number
  prevMonthTotal: number | null
  hit: number
  workDayCount: number
  billable: number
  bestWeekLabel?: string
  bestWeekHours?: number
  topClientName?: string
  topClientShare?: number
  firstName?: string
  isFinished: boolean
}): string {
  const {
    monthTotal, prevMonthTotal, hit, workDayCount, billable,
    bestWeekLabel, bestWeekHours, topClientName, topClientShare,
    firstName, isFinished,
  } = ctx
  const name = firstName || 'you'
  const billRatio = monthTotal > 0 ? billable / monthTotal : 0
  const hitPct = workDayCount > 0 ? hit / workDayCount : 0

  if (monthTotal === 0) return pick([
    'Nothing logged this month yet — give it a start.',
    `Blank month, ${name}. Time to fill it in.`,
  ])

  if (isFinished && prevMonthTotal != null && prevMonthTotal > 0) {
    if (monthTotal >= prevMonthTotal * 1.1) return `Beat last month by ${((monthTotal / prevMonthTotal - 1) * 100).toFixed(0)}%. Strong month.`
    if (monthTotal <= prevMonthTotal * 0.8) return `A lighter month than last. Reset for next one.`
  }

  if (isFinished && hitPct >= 0.85) return pick([
    `You hit goal on ${hit} of ${workDayCount} workdays — almost perfect.`,
    `${hit}/${workDayCount} workdays at 8h+. That's the rhythm.`,
  ])
  if (!isFinished && hitPct >= 0.85) return `${hit}/${workDayCount} workdays on target so far. On a roll, ${name}.`

  if (workDayCount >= 10 && hitPct < 0.3) return `Hit rate is low — ${hit}/${workDayCount} workdays at goal so far.`

  if (monthTotal >= 80 && billRatio >= 0.85) return `${Math.round(billRatio * 100)}% billable this month — invoice-ready.`
  if (monthTotal >= 80 && billRatio < 0.4) return `Lots of internal time this month — only ${Math.round(billRatio * 100)}% billable.`

  if (topClientName && topClientShare != null && topClientShare >= 0.7) {
    return `${topClientName} took ${Math.round(topClientShare * 100)}% of the month. Deep client focus.`
  }

  if (bestWeekLabel && bestWeekHours && bestWeekHours >= 30) {
    return `${bestWeekLabel} was your standout week at ${bestWeekHours.toFixed(0)}h.`
  }

  return pick([
    `Steady month so far, ${name}. Keep the rhythm.`,
    'Month in motion — small consistent days compound fast.',
    `${Math.round(monthTotal)}h on the board. Keep going.`,
  ])
}

// ─── Weekly coach summary ────────────────────────────────────────────
export function weekInsight(ctx: {
  weekTotal: number
  weeklyGoal: number
  hit: number
  workDayCount: number
  billable: number
  prevWeekTotal: number | null
  bestDayName?: string | null
  bestDayHours?: number
  topClientName?: string
  topClientShare?: number // 0..1
  firstName?: string
  isFinished: boolean // week is fully past
}): string {
  const {
    weekTotal, weeklyGoal, hit, workDayCount, billable,
    prevWeekTotal, bestDayName, bestDayHours,
    topClientName, topClientShare, firstName, isFinished,
  } = ctx
  const name = firstName || 'you'
  const billRatio = weekTotal > 0 ? billable / weekTotal : 0

  // Nothing logged yet
  if (weekTotal === 0) return pick([
    `Blank week so far, ${name}. Nothing stopping you from changing that.`,
    'Zero hours logged this week — start one timer and roll.',
    `Fresh week, ${name}. The canvas is empty.`,
  ])

  // Beat last week
  if (prevWeekTotal != null && prevWeekTotal > 0) {
    if (weekTotal >= prevWeekTotal * 1.1) {
      return pick([
        `Ahead of last week already. Momentum's with you, ${name}.`,
        `Up on last week — keep that pace going.`,
        `Week-over-week growth. Nice one, ${name}.`,
      ])
    }
    if (isFinished && weekTotal < prevWeekTotal * 0.8) {
      return `A lighter week than last. That's okay — next one's a fresh shot.`
    }
  }

  // All working days hit
  if (workDayCount > 0 && hit === workDayCount) {
    return pick([
      `You hit goal every working day so far. That's rare air, ${name}.`,
      'Clean sweep — goal hit every weekday this week.',
      `${hit} for ${workDayCount}. Immaculate.`,
    ])
  }

  // Missed most of the week
  if (workDayCount >= 3 && hit === 0 && weekTotal > 0) {
    return pick([
      `Haven't hit goal yet this week. Plenty of week left.`,
      `Logging but not quite at 8h/day. Push one solid session.`,
    ])
  }

  // Strongly billable
  if (weekTotal >= 20 && billRatio >= 0.85) {
    return pick([
      `${Math.round(billRatio * 100)}% billable — this is the healthy kind of week.`,
      `Mostly billable time this week. That's how invoices get fat.`,
    ])
  }
  // Low billable
  if (weekTotal >= 20 && billRatio < 0.4) {
    return pick([
      `Only ${Math.round(billRatio * 100)}% billable this week — lots of internal time.`,
      `Internal-heavy week. Remember to slot billable work in too.`,
    ])
  }

  // Client-concentrated week
  if (topClientName && topClientShare != null && topClientShare >= 0.7) {
    return `Heavy focus on ${topClientName} — ${Math.round(topClientShare * 100)}% of the week.`
  }

  // Best day callout
  if (bestDayName && bestDayHours && bestDayHours >= weeklyGoal / 5) {
    return pick([
      `${bestDayName} carried this week with your strongest session.`,
      `Your ${bestDayName} set the tone — keep that energy.`,
    ])
  }

  // Goal progress fallback
  const pct = weekTotal / weeklyGoal
  if (pct >= 1) return pick([
    `Weekly goal cleared, ${name}. Bonus territory.`,
    `Past 40h — the rest is gravy.`,
  ])
  if (pct >= 0.75) return pick([
    `${Math.round(pct * 100)}% of the way to the weekly goal. Coast it in.`,
    `Nearly at the weekly target. One good session left.`,
  ])
  if (pct >= 0.4) return pick([
    `Halfway-ish to the weekly goal. Stay on rhythm.`,
    `You're pacing towards the weekly goal. Keep rolling.`,
  ])
  return pick([
    `Warming up. Plenty of week to make up ground.`,
    `Early in the week — the best hours are still ahead.`,
  ])
}
