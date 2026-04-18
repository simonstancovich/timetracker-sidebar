// Swedish public holidays — fixed-date, Easter-based, and the movable weekend
// ones (midsummer, all saints'). Sundays are treated as non-working as-is.

function easterSunday(year: number): Date {
  // Gauss's Easter algorithm (Gregorian)
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31) // 3=March, 4=April
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

const pad = (n: number) => String(n).padStart(2, '0')
const dateKey = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

const DAY_MS = 86400000

export function getHolidays(year: number): Map<string, string> {
  const map = new Map<string, string>()
  const add = (d: Date, name: string) => map.set(dateKey(d), name)

  // Fixed
  add(new Date(year, 0, 1), 'Nyårsdagen')
  add(new Date(year, 0, 6), 'Trettondedag jul')
  add(new Date(year, 4, 1), 'Första maj')
  add(new Date(year, 5, 6), 'Sveriges nationaldag')
  add(new Date(year, 11, 24), 'Julafton')
  add(new Date(year, 11, 25), 'Juldagen')
  add(new Date(year, 11, 26), 'Annandag jul')
  add(new Date(year, 11, 31), 'Nyårsafton')

  // Easter-based
  const easter = easterSunday(year)
  add(new Date(easter.getTime() - 2 * DAY_MS), 'Långfredagen')
  add(easter, 'Påskdagen')
  add(new Date(easter.getTime() + 1 * DAY_MS), 'Annandag påsk')
  add(new Date(easter.getTime() + 39 * DAY_MS), 'Kristi himmelsfärds dag')

  // Midsummer — Friday between Jun 19–25 (Midsommarafton),
  // Saturday between Jun 20–26 (Midsommardagen)
  for (let d = 19; d <= 25; d++) {
    const check = new Date(year, 5, d)
    if (check.getDay() === 5) { add(check, 'Midsommarafton'); break }
  }
  for (let d = 20; d <= 26; d++) {
    const check = new Date(year, 5, d)
    if (check.getDay() === 6) { add(check, 'Midsommardagen'); break }
  }

  // All Saints' Day — Saturday between Oct 31 and Nov 6
  for (let offset = 0; offset <= 6; offset++) {
    const check = new Date(year, 9, 31 + offset) // 9=Oct (Date handles overflow)
    if (check.getDay() === 6) { add(check, 'Alla helgons dag') ; break }
  }

  return map
}

/** Mon–Fri AND not a public holiday */
export function isWorkingDay(d: Date, holidays?: Map<string, string>): boolean {
  const day = d.getDay()
  if (day === 0 || day === 6) return false
  const map = holidays || getHolidays(d.getFullYear())
  return !map.has(dateKey(d))
}

export { dateKey }
