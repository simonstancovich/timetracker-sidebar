import { formatLocalDate } from "./date";
import { getHolidays, isWorkingDay } from "./swedishHolidays";

interface StreakAfterLog {
  // The new streak count.
  streak: number;
  // True iff the log advanced the streak (today wasn't already logged).
  bumped: boolean;
}

// Compute the next streak value when a save happens today. Streak is preserved
// if today was already logged; bumps by one if the most recent log was on the
// previous working day (skipping weekends + Swedish holidays); otherwise resets
// to 1 — today is now the only logged day.
export function streakAfterLog(
  prev: number,
  lastLogged: string | null | undefined,
  today: Date = new Date(),
): StreakAfterLog {
  const todayISO = formatLocalDate(today);
  if (lastLogged === todayISO) return { streak: prev, bumped: false };
  const hols = getHolidays(today.getFullYear());
  const cursor = new Date(today);
  do {
    cursor.setDate(cursor.getDate() - 1);
  } while (!isWorkingDay(cursor, hols));
  const prevWDISO = formatLocalDate(cursor);
  return {
    streak: lastLogged === prevWDISO ? prev + 1 : 1,
    bumped: true,
  };
}
