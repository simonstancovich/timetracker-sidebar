import type { Lang } from './i18n'

// Playful status under the timer clock — text and icon kept separate so the
// text can be centered without the icon pulling it off-center.
export function vibe(tSec: number, tRun: boolean, lang: Lang = 'en'): { text: string; icon: string } {
  const en = lang === 'en'
  if (!tRun) return tSec > 0
    ? { text: en ? 'On a break — press ▶ to resume' : 'På paus — tryck ▶ för att återuppta', icon: '' }
    : { text: en ? 'Ready when you are' : 'Redo när du är', icon: '✨' }
  const m = tSec / 60
  if (m < 2)   return { text: en ? 'Warming up' : 'Värmer upp',                icon: '☕' }
  if (m < 10)  return { text: en ? 'Finding flow' : 'Hittar flow',             icon: '🎯' }
  if (m < 25)  return { text: en ? 'In the zone' : 'I zonen',                  icon: '✨' }
  if (m < 50)  return { text: en ? 'Deep focus' : 'Djupt fokus',               icon: '🧘' }
  if (m < 90)  return { text: en ? 'Crushing it' : 'Krossar det',              icon: '🔥' }
  if (m < 150) return { text: en ? 'Unstoppable' : 'Ostoppbar',                icon: '⚡' }
  if (m < 240) return { text: en ? 'Legendary' : 'Legendarisk',                icon: '🏆' }
  return       { text: en ? 'Maybe stretch a little?' : 'Stretcha kanske lite?', icon: '🌱' }
}
