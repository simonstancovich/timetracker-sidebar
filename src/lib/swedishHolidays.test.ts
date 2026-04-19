import { describe, it, expect } from 'vitest'
import { getHolidays, isWorkingDay, dateKey } from './swedishHolidays'

describe('getHolidays', () => {
  it('includes the fixed Swedish holidays for 2026', () => {
    const h = getHolidays(2026)
    expect(h.get('2026-01-01')).toBe('Nyårsdagen')
    expect(h.get('2026-01-06')).toBe('Trettondedag jul')
    expect(h.get('2026-05-01')).toBe('Första maj')
    expect(h.get('2026-06-06')).toBe('Sveriges nationaldag')
    expect(h.get('2026-12-24')).toBe('Julafton')
    expect(h.get('2026-12-25')).toBe('Juldagen')
    expect(h.get('2026-12-26')).toBe('Annandag jul')
    expect(h.get('2026-12-31')).toBe('Nyårsafton')
  })

  it('computes Easter-based holidays correctly (2026: Easter Sunday is April 5)', () => {
    const h = getHolidays(2026)
    expect(h.get('2026-04-03')).toBe('Långfredagen')
    expect(h.get('2026-04-05')).toBe('Påskdagen')
    expect(h.get('2026-04-06')).toBe('Annandag påsk')
    expect(h.get('2026-05-14')).toBe('Kristi himmelsfärds dag')
  })

  it('finds the right Friday/Saturday for midsummer', () => {
    // 2026: Midsommarafton = Friday 2026-06-19, Midsommardagen = Saturday 2026-06-20
    const h = getHolidays(2026)
    expect(h.get('2026-06-19')).toBe('Midsommarafton')
    expect(h.get('2026-06-20')).toBe('Midsommardagen')
  })

  it('finds All Saints Day (Saturday between Oct 31 and Nov 6)', () => {
    // 2026: Alla helgons dag = Saturday 2026-10-31
    const h = getHolidays(2026)
    expect(h.get('2026-10-31')).toBe('Alla helgons dag')
  })

  it('handles a different year (2025: Easter Sunday is April 20)', () => {
    const h = getHolidays(2025)
    expect(h.get('2025-04-20')).toBe('Påskdagen')
    expect(h.get('2025-04-18')).toBe('Långfredagen')
  })
})

describe('isWorkingDay', () => {
  const hols = getHolidays(2026)

  it('treats Mon–Fri as working days', () => {
    expect(isWorkingDay(new Date(2026, 3, 13), hols)).toBe(true) // Monday
    expect(isWorkingDay(new Date(2026, 3, 17), hols)).toBe(true) // Friday
  })

  it('treats Saturday and Sunday as non-working', () => {
    expect(isWorkingDay(new Date(2026, 3, 18), hols)).toBe(false) // Saturday
    expect(isWorkingDay(new Date(2026, 3, 19), hols)).toBe(false) // Sunday
  })

  it('treats public holidays on weekdays as non-working', () => {
    // 2026-05-01 (Första maj) is a Friday
    expect(isWorkingDay(new Date(2026, 4, 1), hols)).toBe(false)
    // 2026-04-03 (Långfredagen) is a Friday
    expect(isWorkingDay(new Date(2026, 3, 3), hols)).toBe(false)
  })

  it('looks up holidays for the date year if no map is passed', () => {
    expect(isWorkingDay(new Date(2025, 0, 1))).toBe(false) // Nyårsdagen 2025
  })
})

describe('dateKey', () => {
  it('produces YYYY-MM-DD', () => {
    expect(dateKey(new Date(2026, 3, 19))).toBe('2026-04-19')
    expect(dateKey(new Date(2026, 0, 1))).toBe('2026-01-01')
  })
})
