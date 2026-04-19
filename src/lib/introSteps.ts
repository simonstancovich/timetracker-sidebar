// Intro tour steps. The structural data (target selector, navigation
// behavior) lives here as language-agnostic records; copy lives in the i18n
// catalogs under the `intro.{key}` namespace and is joined at build time.
//
// To add a step: extend INTRO_STEP_KEYS, add a matching `intro.{key}` block
// to en.json + sv.json, done. No language-specific code touched.

import { type Lang, t, tOpt } from './i18n'

export type IntroStep = {
  target: string | null
  title: string
  body: string
  hint?: string
  nextLabel?: string
  needsManualNext?: boolean
  readOnly?: boolean
}

type IntroStepDef = {
  key: string
  target: string | null
  needsManualNext?: boolean
  readOnly?: boolean
}

const INTRO_STEP_DEFS: IntroStepDef[] = [
  { key: 'welcome',        target: null },
  { key: 'openTimer',      target: 'tab-timer' },
  { key: 'startClock',     target: 'timer-start' },
  { key: 'pickClient',     target: 'timer-company' },
  { key: 'pickProject',    target: 'timer-project' },
  { key: 'describe',       target: 'timer-description', needsManualNext: true },
  { key: 'openToday',      target: 'tab-today' },
  { key: 'todayStats',     target: 'today-stats',       needsManualNext: true, readOnly: true },
  { key: 'todayEntries',   target: 'today-entries',     needsManualNext: true, readOnly: true },
  { key: 'openLog',        target: 'tab-log' },
  { key: 'logHours',       target: 'log-hours',         needsManualNext: true, readOnly: true },
  { key: 'openXp',         target: 'tab-xp' },
  { key: 'xpLevel',        target: 'xp-level',          needsManualNext: true, readOnly: true },
  { key: 'xpAchievements', target: 'xp-achievements',   needsManualNext: true, readOnly: true },
  { key: 'done',           target: null },
]

export function buildIntroSteps(lang: Lang): IntroStep[] {
  return INTRO_STEP_DEFS.map((def) => {
    const ns = `intro.${def.key}`
    return {
      target: def.target,
      title: t(`${ns}.title`, lang),
      body: t(`${ns}.body`, lang),
      hint: tOpt(`${ns}.hint`, lang),
      nextLabel: tOpt(`${ns}.nextLabel`, lang),
      needsManualNext: def.needsManualNext,
      readOnly: def.readOnly,
    }
  })
}
