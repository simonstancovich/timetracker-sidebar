import { describe, it, expect } from 'vitest'
import { fmtClock, fmtHours, parseHoursInput, roundUpToQuarter } from './hours'

describe('fmtClock', () => {
  it('pads to HH:MM:SS', () => {
    expect(fmtClock(0)).toBe('00:00:00')
    expect(fmtClock(5)).toBe('00:00:05')
    expect(fmtClock(65)).toBe('00:01:05')
    expect(fmtClock(3725)).toBe('01:02:05')
  })

  it('floors sub-second fractions', () => {
    expect(fmtClock(59.9)).toBe('00:00:59')
  })

  it('clamps negatives and NaN to zero', () => {
    expect(fmtClock(-5)).toBe('00:00:00')
    expect(fmtClock(NaN)).toBe('00:00:00')
  })
})

describe('fmtHours', () => {
  it('formats whole hours', () => {
    expect(fmtHours(0)).toBe('0:00')
    expect(fmtHours(1)).toBe('1:00')
    expect(fmtHours(8)).toBe('8:00')
  })

  it('formats fractional hours rounded to nearest minute', () => {
    expect(fmtHours(1.5)).toBe('1:30')
    expect(fmtHours(0.25)).toBe('0:15')
    expect(fmtHours(2.75)).toBe('2:45')
  })

  it('rounds tiny values to a minute', () => {
    expect(fmtHours(0.033)).toBe('0:02')
    expect(fmtHours(0.016)).toBe('0:01')
  })

  it('clamps negatives and non-finite to 0:00', () => {
    expect(fmtHours(-1)).toBe('0:00')
    expect(fmtHours(NaN)).toBe('0:00')
    expect(fmtHours(Infinity)).toBe('0:00')
  })
})

describe('parseHoursInput', () => {
  it('parses decimal forms', () => {
    expect(parseHoursInput('1.5')).toBe(1.5)
    expect(parseHoursInput('0.25')).toBe(0.25)
    expect(parseHoursInput('8')).toBe(8)
  })

  it('parses Swedish comma decimal', () => {
    expect(parseHoursInput('1,5')).toBe(1.5)
  })

  it('parses H:MM form', () => {
    expect(parseHoursInput('1:30')).toBe(1.5)
    expect(parseHoursInput('0:15')).toBe(0.25)
    expect(parseHoursInput('8:00')).toBe(8)
  })

  it('parses H:MM:SS form', () => {
    expect(parseHoursInput('1:30:00')).toBe(1.5)
    expect(parseHoursInput('0:00:36')).toBe(0.01)
  })

  it('rejects empty / whitespace', () => {
    expect(parseHoursInput('')).toBeNull()
    expect(parseHoursInput('   ')).toBeNull()
  })

  it('rejects malformed strings', () => {
    expect(parseHoursInput('abc')).toBeNull()
    expect(parseHoursInput('1h 30m')).toBeNull()
    expect(parseHoursInput('1:60')).toBeNull()
    expect(parseHoursInput('1:30:60')).toBeNull()
  })

  it('rejects negatives', () => {
    expect(parseHoursInput('-1')).toBeNull()
  })

  it('trims surrounding whitespace', () => {
    expect(parseHoursInput('  1:30  ')).toBe(1.5)
  })
})

describe('roundUpToQuarter', () => {
  it('leaves exact quarter values unchanged', () => {
    expect(roundUpToQuarter(0.25)).toBe(0.25)
    expect(roundUpToQuarter(0.5)).toBe(0.5)
    expect(roundUpToQuarter(1)).toBe(1)
    expect(roundUpToQuarter(1.75)).toBe(1.75)
  })

  it('rounds partial quarters up', () => {
    expect(roundUpToQuarter(0.1)).toBe(0.25)
    expect(roundUpToQuarter(0.26)).toBe(0.5)
    expect(roundUpToQuarter(1.1)).toBe(1.25)
    expect(roundUpToQuarter(1.51)).toBe(1.75)
  })

  it('enforces a 15-minute minimum', () => {
    expect(roundUpToQuarter(0)).toBe(0.25)
    expect(roundUpToQuarter(0.01)).toBe(0.25)
  })

  it('guards against NaN / negatives', () => {
    expect(roundUpToQuarter(NaN)).toBe(0.25)
    expect(roundUpToQuarter(-1)).toBe(0.25)
  })
})
