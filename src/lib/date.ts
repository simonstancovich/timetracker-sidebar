export function formatLocalDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// Parse a server task_date — either `"YYYY-MM-DD"` or `"YYYY-MM-DD HH:MM:SS"`
// — into a local-time Date pinned to 00:00. Returns null for anything that
// doesn't match. The split-on-"-" approach is unsafe because the day chunk
// carries the time suffix when present.
export function parseTaskDate(s: string | null | undefined): Date | null {
  const m = typeof s === 'string' ? s.match(/^(\d{4})-(\d{2})-(\d{2})/) : null
  if (!m) return null
  const year = Number(m[1])
  const month = Number(m[2])
  const day = Number(m[3])
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null
  return new Date(year, month - 1, day)
}

// Returns the Monday 00:00 of the week containing `d`, in local time. Used
// anywhere we need a stable anchor for a Mon–Fri working week (week-hours
// load, WeekView column layout, isoWeekKey).
export function mondayOf(d: Date): Date {
  const r = new Date(d)
  const day = (r.getDay() + 6) % 7 // shift so Mon=0 … Sun=6
  r.setDate(r.getDate() - day)
  r.setHours(0, 0, 0, 0)
  return r
}

// True when `selectedDate` falls within the current calendar day / week / month.
// Drives the "jump to current" button in the History tab.
export function isOnCurrent(
  scale: 'day' | 'week' | 'month',
  selectedDate: Date,
): boolean {
  const now = new Date()
  if (scale === 'day') {
    return formatLocalDate(selectedDate) === formatLocalDate(now)
  }
  if (scale === 'week') {
    return +mondayOf(selectedDate) === +mondayOf(now)
  }
  return (
    selectedDate.getFullYear() === now.getFullYear() &&
    selectedDate.getMonth() === now.getMonth()
  )
}
