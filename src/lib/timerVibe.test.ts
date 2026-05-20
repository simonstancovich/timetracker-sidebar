import { describe, it, expect } from 'vitest'
import { getTimerVibe } from './timerVibe'

describe('getTimerVibe — not running', () => {
  it('returns idle when timer is at zero', () => {
    const v = getTimerVibe(0, false, 'en')
    expect(v.text).toBe('Ready when you are')
    expect(v.icon).toBe('✨')
  })

  it('returns paused when tSec > 0 and not running', () => {
    const v = getTimerVibe(600, false, 'en')
    expect(v.text).toMatch(/break/i)
    expect(v.icon).toBe('')
  })

  it('resolves Swedish strings', () => {
    expect(getTimerVibe(0, false, 'sv').text).toBe('Redo när du är')
    expect(getTimerVibe(600, false, 'sv').text).toBe('På paus — tryck resume när du är tillbaka.')
  })
})

describe('getTimerVibe — running tiers', () => {
  const tierAt = (minutes: number) => getTimerVibe(minutes * 60, true, 'en')

  it('picks warmup under 2 minutes', () => {
    expect(tierAt(0).icon).toBe('☕')
    expect(tierAt(1.9).icon).toBe('☕')
  })

  it('picks flow between 2 and 10 minutes', () => {
    expect(tierAt(2).icon).toBe('🎯')
    expect(tierAt(9.9).icon).toBe('🎯')
  })

  it('picks zone between 10 and 25 minutes', () => {
    expect(tierAt(10).icon).toBe('✨')
    expect(tierAt(24.9).icon).toBe('✨')
  })

  it('picks deep focus between 25 and 50 minutes', () => {
    expect(tierAt(25).icon).toBe('🧘')
  })

  it('picks crushing it between 50 and 90 minutes', () => {
    expect(tierAt(50).icon).toBe('🔥')
  })

  it('picks unstoppable between 90 and 150 minutes', () => {
    expect(tierAt(90).icon).toBe('⚡')
  })

  it('picks legendary between 150 and 240 minutes', () => {
    expect(tierAt(150).icon).toBe('🏆')
  })

  it('suggests stretch past 240 minutes', () => {
    expect(tierAt(240).icon).toBe('🌱')
    expect(tierAt(600).icon).toBe('🌱')
  })
})
