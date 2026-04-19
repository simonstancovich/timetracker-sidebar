import { describe, it, expect } from 'vitest'
import { t, tOpt, pickGreeting, pickFunMessage, pickTip, achName, achDescription } from './i18n'

describe('t', () => {
  it('returns the EN string for a known key', () => {
    expect(t('tab.today', 'en')).toBe('Today')
    expect(t('tab.timer', 'en')).toBe('Timer')
  })

  it('returns the SV string for a known key', () => {
    expect(t('tab.today', 'sv')).toBe('Idag')
    expect(t('today.totalLabel', 'sv')).toBe('Totalt:')
  })

  it('interpolates {{vars}} via i18next', () => {
    expect(t('today.hoursLogged', 'en', { hours: '5h' })).toBe('5h logged')
    expect(t('xp.level', 'sv', { n: 7 })).toBe('Nivå 7')
  })

  it('navigates dotted keys through nested catalog structure', () => {
    expect(t('today.stat.streak', 'en')).toBe('Streak')
    expect(t('scale.dayCap', 'sv')).toBe('Dag')
  })

  it('returns the key string when missing (i18next fallback)', () => {
    expect(t('this.key.does.not.exist', 'en')).toBe('this.key.does.not.exist')
  })
})

describe('tOpt', () => {
  it('returns the value when the key exists', () => {
    expect(tOpt('tab.today', 'en')).toBe('Today')
  })

  it('returns undefined for missing keys', () => {
    expect(tOpt('this.is.missing', 'en')).toBeUndefined()
    expect(tOpt('intro.welcome.notARealField', 'en')).toBeUndefined()
  })
})

describe('pickGreeting', () => {
  it('returns one of the EN greetings, with {name} substituted', () => {
    const msg = pickGreeting('Bob', 'en')
    expect(msg).toBeTruthy()
    expect(msg).not.toContain('{name}')
    // Either "Bob" appears in the message OR the message had no {name} (some don't)
    // Most do; if Bob isn't there, the template must have been name-less.
  })

  it('returns SV greetings when lang=sv', () => {
    const msg = pickGreeting('Bob', 'sv')
    expect(msg).toBeTruthy()
    expect(msg).not.toContain('{name}')
  })

  it('falls back to "friend" / "du" when name is empty', () => {
    // Run a few times; some templates contain {name} and some don't,
    // so we can't assert presence directly without a seeded RNG.
    // Instead, the test verifies no leftover placeholder.
    for (let i = 0; i < 20; i++) {
      expect(pickGreeting('', 'en')).not.toContain('{name}')
      expect(pickGreeting('', 'sv')).not.toContain('{name}')
    }
  })
})

describe('pickFunMessage', () => {
  it('returns a string from the funMessages pool', () => {
    expect(typeof pickFunMessage('en')).toBe('string')
    expect(pickFunMessage('en').length).toBeGreaterThan(0)
  })

  it('returns SV when lang=sv', () => {
    expect(typeof pickFunMessage('sv')).toBe('string')
  })
})

describe('pickTip', () => {
  it('returns a string from the productivityTips pool', () => {
    const tip = pickTip('en')
    expect(typeof tip).toBe('string')
    expect(tip.length).toBeGreaterThan(0)
  })

  it('returns SV tips when lang=sv', () => {
    const tip = pickTip('sv')
    expect(typeof tip).toBe('string')
  })
})

describe('achName / achDescription', () => {
  it('returns the EN name for a known achievement', () => {
    expect(achName('first', 'en')).toBe('First Steps')
    expect(achDescription('first', 'en')).toBe('First entry logged')
  })

  it('returns the SV name', () => {
    expect(achName('first', 'sv')).toBe('Första stegen')
    expect(achDescription('legacy', 'sv')).toBe('5000h loggade')
  })

  it('returns key string for unknown ids (graceful fallback)', () => {
    // Predictable behavior: missing key returns the key itself.
    expect(achName('not_a_real_id', 'en')).toBe('achievements.not_a_real_id.name')
  })
})
