// Contextual timer insights. The goal is to make the app feel alive —
// aware of the time of day, the user's progress, and what state the
// timer is in. Keep messages short and punchy.

export interface InsightCtx {
  tRun: boolean
  tSec: number
  tCo: string
  tPr: string
  tD: string
  todayH: number
  goal: number
  entriesToday: number
  lastProjectName?: string
  streak: number
  firstName?: string
}

const fmt = (h: number) => {
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  return `${hh}:${String(mm).padStart(2, '0')}`
}

const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]

export function getTimerInsight(ctx: InsightCtx): string {
  const hour = new Date().getHours()
  const name = ctx.firstName || 'you'

  // ─── Critical: missing required fields ─────────────────────────────
  if (!ctx.tCo) {
    return pick([
      'Pick a client to start tracking.',
      'Who are you working for today?',
      'Start by picking a client.',
      'Client first, then the rest falls into place.',
    ])
  }
  if (!ctx.tPr) {
    return pick([
      'Now pick a project.',
      'Which project is this under?',
      'Project next — pick one to keep it tidy.',
    ])
  }
  if (!ctx.tD.trim()) {
    return pick([
      'Give it a short description — future-you will thank you.',
      'One line about what you\'re doing.',
      'Describe the task. Even roughly.',
      'A rough description beats no description.',
    ])
  }

  // ─── Running: pace / zone awareness ────────────────────────────────
  if (ctx.tRun) {
    const m = ctx.tSec / 60
    if (m < 3) return pick([
      'Just started — find your rhythm.',
      'Settling in. Deep breath.',
      'Fresh timer. Let\'s see where this goes.',
      'Off you go. Stay with it.',
    ])
    if (m < 15) return pick([
      'Warming up — keep the momentum.',
      'Finding flow — don\'t break it.',
      'Great pace so far.',
      'In the zone. Stay off Slack.',
    ])
    if (m < 30) return pick([
      'Deep work territory. Nice.',
      '20+ minutes in — this is where magic happens.',
      'You\'re past the friction. Keep going.',
    ])
    if (m < 60) return pick([
      'Crushing a long session. Respect.',
      'Half hour+. Strong focus.',
      'Nearly an hour of flow. Unusual and impressive.',
    ])
    if (m < 120) return pick([
      `${Math.floor(m)} min straight. Maybe stretch?`,
      'Over an hour. Water? Walk? Blink?',
      'Long session — eyes OK? Back OK?',
    ])
    return pick([
      `${Math.floor(m / 60)}h+ non-stop — you\'re a machine.`,
      'This is either brilliant or concerning. Both?',
      'Consider calling it soon. Your back knows.',
    ])
  }

  // ─── Not running: contextual nudges ────────────────────────────────
  const ratio = ctx.todayH / ctx.goal

  // First task of the day
  if (ctx.entriesToday === 0 && ctx.todayH === 0) {
    const morning = hour < 10
    const afternoon = hour >= 12 && hour < 17
    if (morning) return pick([
      'First task of the day. Set the tone, ' + name + '.',
      'Fresh slate. Pick something important.',
      'Morning run — start strong.',
      `${name}, what\'s the one thing to finish before lunch?`,
    ])
    if (afternoon) return pick([
      'No entries yet today — time to catch up.',
      `Let\'s log some hours, ${name}.`,
      'Afternoon reset. Start your timer.',
    ])
    return pick([
      'Late start? Log what you do, no judgement.',
      'Still time to log something meaningful.',
      `Go on, ${name}. One solid task.`,
    ])
  }

  // Goal already hit
  if (ratio >= 1) {
    return pick([
      `Goal crushed — anything past this is bonus.`,
      `${fmt(ctx.todayH)}h logged. Take the W.`,
      'You hit 8h — everything else is frosting.',
      'Goal reached. Keep going or call it.',
      `${name}, the goal is done. You\'re playing with house money now.`,
    ])
  }

  // Close to goal
  if (ratio >= 0.75) {
    return pick([
      `${fmt(ctx.goal - ctx.todayH)}h from goal. One focused session.`,
      'Nearly there — don\'t lose steam.',
      `You\'re ${Math.round(ratio * 100)}% of the way. Push.`,
      'The last stretch is where streaks are built.',
    ])
  }

  // Mid-progress
  if (ratio >= 0.4) {
    return pick([
      `${fmt(ctx.todayH)}h logged, ${fmt(ctx.goal - ctx.todayH)}h to go.`,
      'Solid progress. Keep rolling.',
      'You\'re ahead of "nothing", which is the hardest to beat.',
      'Halfway-ish. The afternoon is yours.',
    ])
  }

  // Early progress
  if (ratio > 0) {
    return pick([
      'Started the ball rolling. Keep it going.',
      `${fmt(ctx.todayH)}h down, more to come.`,
      'One done, more to come.',
      'Momentum is lighter than starting from zero.',
    ])
  }

  // Time-of-day fallback
  if (hour < 9) return pick([
    'Early bird energy. Nice and quiet.',
    'Morning focus is the sharpest.',
    'Crisp morning — start something real.',
  ])
  if (hour < 12) return pick([
    'Morning hustle. This is prime time.',
    'Mid-morning — strongest focus window.',
  ])
  if (hour < 14) return pick([
    'Lunch approaches — finish one thing first.',
    'Pre-lunch push is a cheat code.',
  ])
  if (hour < 17) return pick([
    'Afternoon push — fight the slump.',
    'Post-lunch? Caffeine or a walk. Then go.',
  ])
  if (hour < 20) return pick([
    'Evening work. Wind down strong.',
    'Last solid session of the day — make it count.',
  ])
  if (hour < 23) return pick([
    'Night shift? Log it properly.',
    'Late hours — respect.',
  ])
  return pick([
    'Past midnight. Sure about this?',
    'You might be a vampire. Log your hours anyway.',
  ])
}
