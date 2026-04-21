import { t, type Lang } from './i18n'

// Playful status line shown under the timer clock. Text comes from the i18n
// catalog under `timer.vibe.*`; the icon + duration thresholds are language-
// agnostic and live here with the rule table.

type VibeKey =
  | 'paused'
  | 'idle'
  | 'warmup'
  | 'flow'
  | 'zone'
  | 'deepFocus'
  | 'crushing'
  | 'unstoppable'
  | 'legendary'
  | 'stretch'

interface Vibe {
  key: VibeKey
  icon: string
}

// Ordered from low to high minutes. First entry whose `maxMin` is greater
// than the running timer wins.
const RUNNING_TIERS: Array<{ maxMin: number; vibe: Vibe }> = [
  { maxMin: 2,        vibe: { key: 'warmup',      icon: '☕' } },
  { maxMin: 10,       vibe: { key: 'flow',        icon: '🎯' } },
  { maxMin: 25,       vibe: { key: 'zone',        icon: '✨' } },
  { maxMin: 50,       vibe: { key: 'deepFocus',   icon: '🧘' } },
  { maxMin: 90,       vibe: { key: 'crushing',    icon: '🔥' } },
  { maxMin: 150,      vibe: { key: 'unstoppable', icon: '⚡' } },
  { maxMin: 240,      vibe: { key: 'legendary',   icon: '🏆' } },
  { maxMin: Infinity, vibe: { key: 'stretch',     icon: '🌱' } },
]

function resolveVibe(tSec: number, tRun: boolean): Vibe {
  if (!tRun) {
    return tSec > 0
      ? { key: 'paused', icon: '' }
      : { key: 'idle',   icon: '✨' }
  }
  const m = tSec / 60
  return RUNNING_TIERS.find((tier) => m < tier.maxMin)!.vibe
}

export function getTimerVibe(
  tSec: number,
  tRun: boolean,
  lang: Lang = 'en',
): { text: string; icon: string } {
  const v = resolveVibe(tSec, tRun)
  return { text: t(`timer.vibe.${v.key}`, lang), icon: v.icon }
}
