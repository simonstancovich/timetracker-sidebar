import { formatLocalDate } from "./date";
import { getHolidays, isWorkingDay } from "./swedishHolidays";

export const HOURS_PER_WORKDAY = 8;

// ISO date strings (YYYY-MM-DD) of the working days in [fromISO, toISO],
// skipping weekends and Swedish holidays. Used to fan an absence report out
// into one full-day entry per working day. Empty for an invalid/reversed range.
export function workingDaysInRange(fromISO: string, toISO: string): string[] {
  const from = new Date(`${fromISO}T00:00:00`);
  const to = new Date(`${toISO}T00:00:00`);
  if (
    Number.isNaN(from.getTime()) ||
    Number.isNaN(to.getTime()) ||
    from > to
  ) {
    return [];
  }
  const out: string[] = [];
  const holsByYear = new Map<number, Map<string, string>>();
  const d = new Date(from);
  while (d <= to) {
    const y = d.getFullYear();
    let hols = holsByYear.get(y);
    if (!hols) {
      hols = getHolidays(y);
      holsByYear.set(y, hols);
    }
    if (isWorkingDay(d, hols)) out.push(formatLocalDate(d));
    d.setDate(d.getDate() + 1);
    if (out.length > 1000) break; // safety cap for absurd ranges
  }
  return out;
}
