import { useTranslation } from "../lib/i18n";
import * as prim from "../primitives";
import * as s from "./WeekHeadsUp.css";

const fmtHours = (h: number) => {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${hh}:${String(mm).padStart(2, "0")}`;
};

interface Props {
  overtimeHours: number;
  weeklyGoal: number;
  weekendHours: number;
  longDays: Date[];
  locale: string;
}

export function WeekHeadsUp({
  overtimeHours,
  weeklyGoal,
  weekendHours,
  longDays,
  locale,
}: Props) {
  const { t } = useTranslation();
  if (overtimeHours === 0 && weekendHours === 0 && longDays.length === 0) return null;
  return (
    <prim.Stack className={s.wrap}>
      <prim.Text as="div" className={s.eyebrow}>
        {t("week.headsUp")}
      </prim.Text>
      <prim.Stack className={s.list}>
        {overtimeHours > 0 && (
          <prim.Text as="div">
            · {fmtHours(overtimeHours)} {t("week.overtime", { goal: fmtHours(weeklyGoal) })}
          </prim.Text>
        )}
        {longDays.length > 0 && (
          <prim.Text as="div">
            ·{" "}
            {t(
              longDays.length === 1 ? "week.overTenDays" : "week.overTenDaysPlural",
              { n: longDays.length },
            )}{" "}
            ({longDays.map((d) => d.toLocaleDateString(locale, { weekday: "short" })).join(", ")})
          </prim.Text>
        )}
        {weekendHours > 0 && (
          <prim.Text as="div">
            · {fmtHours(weekendHours)} {t("week.weekendHours")}
          </prim.Text>
        )}
      </prim.Stack>
    </prim.Stack>
  );
}
