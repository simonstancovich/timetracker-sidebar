import { isWorkingDay, dateKey } from "../lib/swedishHolidays";
import * as prim from "../primitives";
import { WeekDayCard } from "./WeekDayCard";
import * as s from "./WeekDayGrid.css";

const WEEKDAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI"] as const;

const fmtHours = (h: number) => {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${hh}:${String(mm).padStart(2, "0")}`;
};

interface Props {
  dates: Date[];
  hoursByDate: Record<string, number>;
  holidays: Map<string, string>;
  goal: number;
  loaded: boolean;
  locale: string;
  todayKey: string;
  onPickDay: (d: Date) => void;
}

export function WeekDayGrid({
  dates,
  hoursByDate,
  holidays,
  goal,
  loaded,
  locale,
  todayKey,
  onPickDay,
}: Props) {
  const now = new Date();
  return (
    <prim.Grid columns={5} gap="none" className={s.grid}>
      {dates.slice(0, 5).map((d, idx) => {
        const k = dateKey(d);
        const h = hoursByDate[k] || 0;
        const isToday = todayKey === k;
        const holiday = holidays.get(k);
        const isFuture = d > now;
        const isWorkday = isWorkingDay(d, holidays);
        const hoursTone = isToday
          ? "today"
          : isFuture
            ? "future"
            : h >= goal
              ? "hit"
              : h > 0
                ? "partial"
                : isWorkday
                  ? "missed"
                  : "muted";
        const titleDate = d.toLocaleDateString(locale, {
          weekday: "long",
          day: "numeric",
          month: "short",
        });
        return (
          <WeekDayCard
            key={k}
            weekday={WEEKDAY_LABELS[idx] ?? ""}
            dayNumber={loaded ? String(d.getDate()) : " "}
            hoursLabel={
              loaded
                ? h > 0
                  ? fmtHours(h)
                  : isFuture || !isWorkday
                    ? "—"
                    : "0:00"
                : " "
            }
            hoursTone={hoursTone}
            isToday={isToday}
            loaded={loaded}
            title={holiday ? `${titleDate} · ${holiday}` : titleDate}
            onClick={() => onPickDay(d)}
          />
        );
      })}
    </prim.Grid>
  );
}
