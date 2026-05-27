import { vars } from "../theme";
import type { CSSProperties } from "react";
import { dateKey } from "../lib/swedishHolidays";
import { fmtHours } from "../lib/hours";
import { MONO, SERIF } from "../lib/fonts";

interface Props {
  date: Date | null;
  dayKey: string;
  hours: number;
  holiday: string | undefined;
  goal: number;
  loaded: boolean;
  onPick: (d: Date) => void;
}

interface CellTone {
  bg: string;
  border: string;
  numColor: string;
  hoursColor: string;
}

// The cell's appearance is data-driven heatmap: green intensity scales with how
// far past goal the day went, amber = partial, red = missed workday, dashed =
// off day. Colours are computed (alpha ramps, status hexes) so they stay inline.
function cellTone(
  isToday: boolean,
  hours: number,
  goal: number,
  isFuture: boolean,
  isWorkday: boolean,
): CellTone {
  if (isToday) {
    return { bg: `color-mix(in srgb, ${vars.typography.accent} 10%, transparent)`, border: `1.5px solid ${vars.typography.accent}`, numColor: vars.typography.accent, hoursColor: vars.typography.accent };
  }
  if (hours >= goal) {
    const heatPct = Math.min(1, hours / (goal * 1.5));
    const alphaPct = Math.round(((50 + heatPct * 110) / 255) * 100);
    return {
      bg: `color-mix(in srgb, ${vars.typography.green} ${alphaPct}%, transparent)`,
      border: `1px solid color-mix(in srgb, ${vars.typography.green} 40%, transparent)`,
      numColor: vars.typography.goalInk,
      hoursColor: vars.typography.goalInk,
    };
  }
  if (!isFuture && hours > 0) {
    return {
      bg: "rgba(217, 119, 6, 0.12)",
      border: "1px solid rgba(217, 119, 6, 0.45)",
      numColor: vars.typography.primary,
      hoursColor: vars.typography.partialInk,
    };
  }
  if (!isFuture && isWorkday) {
    return {
      bg: "rgba(239, 68, 68, 0.08)",
      border: "1px solid rgba(239, 68, 68, 0.35)",
      numColor: vars.typography.primary,
      hoursColor: vars.typography.missedInk,
    };
  }
  const border = isWorkday ? `1px solid ${vars.border.soft}` : `1px dashed ${vars.border.soft}`;
  return { bg: "transparent", border, numColor: vars.typography.faint, hoursColor: vars.typography.secondary };
}

const cellButton: CSSProperties = {
  aspectRatio: "1 / 1",
  borderRadius: 8,
  padding: 2,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 1,
  cursor: "pointer",
  position: "relative",
  transition: "all 140ms ease",
};

const dayNumber: CSSProperties = {
  fontFamily: SERIF,
  fontSize: 18,
  lineHeight: 1,
  fontVariantNumeric: "tabular-nums",
  letterSpacing: -0.4,
};

const hoursLabel: CSSProperties = {
  fontFamily: MONO,
  fontSize: 9,
  fontWeight: 700,
  lineHeight: 1,
  fontVariantNumeric: "tabular-nums",
  letterSpacing: 0.3,
};

export function MonthDayCell({ date, dayKey, hours, holiday, goal, loaded, onPick }: Props) {
  if (!date) return <div />;
  if (!loaded) {
    return <div className="skeleton" style={{ aspectRatio: "1 / 1", borderRadius: 8 }} />;
  }

  const isToday = dateKey(new Date()) === dayKey;
  const isFuture = date > new Date();
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const isWorkday = !isWeekend && !holiday;

  const tone = cellTone(isToday, hours, goal, isFuture, isWorkday);
  const showHours = !isFuture && (hours > 0 || isWorkday);

  const dayNum = date.getDate();
  const title = holiday
    ? `${dayNum} · ${holiday}${hours > 0 ? ` · ${fmtHours(hours)}` : ""}`
    : isWorkday
      ? `${dayNum} · ${fmtHours(hours)}`
      : `${dayNum}`;

  return (
    <button
      onClick={() => onPick(date)}
      title={title}
      style={{ ...cellButton, background: tone.bg, border: tone.border }}
    >
      <span style={{ ...dayNumber, color: tone.numColor }}>{dayNum}</span>
      {showHours && (
        <span style={{ ...hoursLabel, color: tone.hoursColor }}>
          {hours > 0 ? fmtHours(hours) : "0:00"}
        </span>
      )}
    </button>
  );
}
