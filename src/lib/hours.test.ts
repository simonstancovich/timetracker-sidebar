import { describe, it, expect } from 'vitest'
import { fmtHours, parseHoursInput } from './hours'

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
