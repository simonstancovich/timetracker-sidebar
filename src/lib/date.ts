export function formatLocalDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
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
