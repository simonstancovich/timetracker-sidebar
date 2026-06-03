import { dateKey } from "../lib/swedishHolidays";
import { fmtHours } from "../lib/hours";
import { cx } from "../lib/cx";
import * as prim from "../primitives";
import * as s from "./MonthDayCell.css";

interface Props {
  date: Date | null;
  dayKey: string;
  hours: number;
  holiday: string | undefined;
  goal: number;
  loaded: boolean;
  onPick: (d: Date) => void;
}

type Tone = "today" | "goal" | "partial" | "missed" | "workday" | "off";
type Heat = "20" | "30" | "40" | "50" | "60";

const NUM_COLOR: Record<Tone, prim.TextColor> = {
  today: "accent",
  goal: "goalInk",
  partial: "primary",
  missed: "primary",
  workday: "faint",
  off: "faint",
};

const HOURS_COLOR: Record<Tone, prim.MonoTextColor> = {
  today: "accent",
  goal: "goalInk",
  partial: "partialInk",
  missed: "missedInk",
  workday: "secondary",
  off: "secondary",
};

function pickTone(isToday: boolean, hours: number, goal: number, isFuture: boolean, isWorkday: boolean): Tone {
  if (isToday) return "today";
  if (hours >= goal) return "goal";
  if (!isFuture && hours > 0) return "partial";
  if (!isFuture && isWorkday) return "missed";
  return isWorkday ? "workday" : "off";
}

function pickHeat(hours: number, goal: number): Heat {
  const heatPct = Math.min(1, hours / (goal * 1.5));
  const alpha = Math.round(20 + heatPct * 43);
  if (alpha >= 55) return "60";
  if (alpha >= 45) return "50";
  if (alpha >= 35) return "40";
  if (alpha >= 25) return "30";
  return "20";
}

export function MonthDayCell({ date, dayKey, hours, holiday, goal, loaded, onPick }: Props) {
  if (!date) return <prim.Stack>{null}</prim.Stack>;
  if (!loaded) return <prim.Skeleton className={s.skeletonCell} />;

  const now = new Date();
  const day = date.getDay();
  const isToday = dateKey(now) === dayKey;
  const isFuture = date > now;
  const isWeekend = day === 0 || day === 6;
  const isWorkday = !isWeekend && !holiday;
  const tone = pickTone(isToday, hours, goal, isFuture, isWorkday);
  const heat = tone === "goal" ? pickHeat(hours, goal) : null;
  const showHours = !isFuture && (hours > 0 || isWorkday);

  const dayNum = date.getDate();
  const hoursText = hours > 0 ? fmtHours(hours) : "0:00";
  const title = holiday
    ? `${dayNum} · ${holiday}${hours > 0 ? ` · ${hoursText}` : ""}`
    : isWorkday
      ? `${dayNum} · ${hoursText}`
      : `${dayNum}`;

  return (
    <prim.Button
      variant="link"
      onClick={() => onPick(date)}
      title={title}
      className={cx(s.cell, s.tone[tone], heat && s.heat[heat])}
    >
      <prim.Text as="span" color={NUM_COLOR[tone]} className={s.dayNumber}>
        {dayNum}
      </prim.Text>
      {showHours && (
        <prim.MonoText size="2xs" color={HOURS_COLOR[tone]} className={s.hoursLabel}>
          {hoursText}
        </prim.MonoText>
      )}
    </prim.Button>
  );
}
