import { t, type Lang } from './i18n'

// Playful status under the timer clock — text and icon kept separate so the
// text can be centered without the icon pulling it off-center.
export function vibe(tSec: number, tRun: boolean, lang: Lang = 'en'): { text: string; icon: string } {
  if (!tRun) return tSec > 0
    ? { text: t('vibe.onBreak', lang), icon: '' }
    : { text: t('vibe.ready', lang), icon: '✨' }
  const m = tSec / 60
  if (m < 2)   return { text: t('vibe.warmingUp', lang),   icon: '☕' }
  if (m < 10)  return { text: t('vibe.findingFlow', lang), icon: '🎯' }
  if (m < 25)  return { text: t('vibe.inTheZone', lang),   icon: '✨' }
  if (m < 50)  return { text: t('vibe.deepFocus', lang),   icon: '🧘' }
  if (m < 90)  return { text: t('vibe.crushingIt', lang),  icon: '🔥' }
  if (m < 150) return { text: t('vibe.unstoppable', lang), icon: '⚡' }
  if (m < 240) return { text: t('vibe.legendary', lang),   icon: '🏆' }
  return         { text: t('vibe.stretch', lang),          icon: '🌱' }
}
