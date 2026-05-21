import { describe, it, expect } from 'vitest'
import { buildIntroSteps } from './introSteps'

describe('buildIntroSteps', () => {
  it('returns 26 steps for both languages', () => {
    expect(buildIntroSteps('en')).toHaveLength(26)
    expect(buildIntroSteps('sv')).toHaveLength(26)
  })

  it('first step has no target (welcome screen)', () => {
    const en = buildIntroSteps('en')
    expect(en[0].target).toBeNull()
    expect(en[0].title).toBe("Time tracking shouldn't feel like homework.")
  })

  it('last step has no target (done screen)', () => {
    const en = buildIntroSteps('en')
    expect(en[en.length - 1].target).toBeNull()
    expect(en[en.length - 1].title).toBe("That's the whole tour.")
  })

  it('translates titles into Swedish', () => {
    const sv = buildIntroSteps('sv')
    expect(sv[0].title).toBe('Tidsrapportering ska inte kännas som läxa.')
  })

  it('marks needsManualNext / readOnly correctly on the structural steps', () => {
    const en = buildIntroSteps('en')
    const today = en.find((s) => s.target === 'today-stats')!
    expect(today.needsManualNext).toBe(true)
    expect(today.readOnly).toBe(true)
  })

  it('omits hint when not present in the catalog', () => {
    const en = buildIntroSteps('en')
    const openTimer = en.find((s) => s.target === 'tab-timer')!
    expect(openTimer.hint).toBeUndefined()
  })

  it('includes hint when present (pickClient step)', () => {
    const en = buildIntroSteps('en')
    const pick = en.find((s) => s.target === 'timer-company')!
    expect(pick.hint).toBe('The list narrows as you type — no scrolling 600 clients.')
  })

  it('attaches the correct target selector to each step', () => {
    const en = buildIntroSteps('en')
    const targets = en.map((s) => s.target)
    expect(targets).toEqual([
      null,
      'tab-timer',
      'timer-start',
      'timer-company',
      'timer-project',
      'timer-description',
      'timer-note',
      'timer-invoiceable',
      'timer-done',
      'timer-switch',
      'timer-sidequest',
      'timer-controls',
      'timer-stats',
      'tab-today',
      'today-stats',
      'today-entries',
      'tab-history',
      'tab-history',
      'tab-xp',
      'xp-level',
      'xp-achievements',
      'footer-theme',
      'footer-pin',
      'footer-lang',
      'footer-help',
      null,
    ])
  })
})
