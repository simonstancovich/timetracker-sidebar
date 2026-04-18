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
