import type { CSSProperties } from "react";
import { dateKey } from "../lib/swedishHolidays";
import { fmtHours } from "../lib/hours";

// Only the theme tokens this cell paints with.
interface CellTheme {
  ac: string;
  gn: string;
  b1: string;
  t1: string;
  t2: string;
  tf: string;
  goalInk: string;
  partialInk: string;
  missedInk: string;
}

interface Props {
  date: Date | null;
  dayKey: string;
  hours: number;
  holiday: string | undefined;
  goal: number;
  loaded: boolean;
  M: CellTheme;
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
  M: CellTheme,
  isToday: boolean,
  hours: number,
  goal: number,
  isFuture: boolean,
  isWorkday: boolean,
): CellTone {
  if (isToday) {
    return { bg: `${M.ac}1a`, border: `1.5px solid ${M.ac}`, numColor: M.ac, hoursColor: M.ac };
  }
  if (hours >= goal) {
    const heatPct = Math.min(1, hours / (goal * 1.5));
    const alphaHex = Math.round(50 + heatPct * 110).toString(16).padStart(2, "0");
    return {
      bg: `${M.gn}${alphaHex}`,
      border: `1px solid ${M.gn}66`,
      numColor: M.goalInk,
      hoursColor: M.goalInk,
    };
  }
  if (!isFuture && hours > 0) {
    return {
      bg: "rgba(217, 119, 6, 0.12)",
      border: "1px solid rgba(217, 119, 6, 0.45)",
      numColor: M.t1,
      hoursColor: M.partialInk,
    };
  }
  if (!isFuture && isWorkday) {
    return {
      bg: "rgba(239, 68, 68, 0.08)",
      border: "1px solid rgba(239, 68, 68, 0.35)",
      numColor: M.t1,
      hoursColor: M.missedInk,
    };
  }
  const border = isWorkday ? `1px solid ${M.b1}` : `1px dashed ${M.b1}`;
  return { bg: "transparent", border, numColor: M.tf, hoursColor: M.t2 };
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
  fontFamily: '"Instrument Serif","Georgia",serif',
  fontSize: 18,
  lineHeight: 1,
  fontVariantNumeric: "tabular-nums",
  letterSpacing: -0.4,
};

const hoursLabel: CSSProperties = {
  fontFamily: '"JetBrains Mono",ui-monospace,monospace',
  fontSize: 9,
  fontWeight: 700,
  lineHeight: 1,
  fontVariantNumeric: "tabular-nums",
  letterSpacing: 0.3,
};

export function MonthDayCell({ date, dayKey, hours, holiday, goal, loaded, M, onPick }: Props) {
  if (!date) return <div />;
  if (!loaded) {
    return <div className="skeleton" style={{ aspectRatio: "1 / 1", borderRadius: 8 }} />;
  }

  const isToday = dateKey(new Date()) === dayKey;
  const isFuture = date > new Date();
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const isWorkday = !isWeekend && !holiday;

  const tone = cellTone(M, isToday, hours, goal, isFuture, isWorkday);
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
