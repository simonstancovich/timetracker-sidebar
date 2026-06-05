import { Fragment } from "react";
import { useTranslation } from "../lib/i18n";
import { cx } from "../lib/cx";
import * as prim from "../primitives";
import * as s from "./WeekGoalProgress.css";

const fmtHours = (h: number) => {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${hh}:${String(mm).padStart(2, "0")}`;
};

interface Props {
  weekTotal: number;
  weeklyGoal: number;
  weekDelta: number | null;
  flexBalance: number;
}

export function WeekGoalProgress({ weekTotal, weeklyGoal, weekDelta, flexBalance }: Props) {
  const { t } = useTranslation();
  const hit = weekTotal >= weeklyGoal;
  const goalPct = weeklyGoal > 0 ? Math.min(100, (weekTotal / weeklyGoal) * 100) : 0;
  return (
    <prim.Stack className={s.wrap}>
      <prim.Stack className={s.headerRow}>
        <prim.Text as="span" className={s.headerLabel}>
          {t("week.weeklyGoal")}
        </prim.Text>
        <prim.Text as="span" className={s.headerValue}>
          <prim.Text as="span" className={hit ? s.totalHit : s.totalProgress}>
            {fmtHours(weekTotal)}
          </prim.Text>
          <prim.Text as="span" className={s.goalNumber}>
            {" / "}
            {fmtHours(weeklyGoal)}
          </prim.Text>
        </prim.Text>
      </prim.Stack>
      <prim.ProgressBar value={goalPct / 100} tone={hit ? "green" : "accent"} size="thin" />
      <prim.Stack className={s.footerRow}>
        <prim.Text as="span" className={s.deltaText}>
          {weekDelta == null ? (
            ""
          ) : weekDelta === 0 ? (
            t("week.sameAsLastWeek")
          ) : weekDelta > 0 ? (
            <Fragment>
              +{fmtHours(weekDelta)} {t("week.vsLastWeek")}
            </Fragment>
          ) : (
            <Fragment>
              {fmtHours(weekDelta)} {t("week.vsLastWeek")}
            </Fragment>
          )}
        </prim.Text>
        <prim.Text as="span" className={s.flex}>
          <prim.Text as="span" className={s.flexLabel}>
            {t("week.flex")}{" "}
          </prim.Text>
          <prim.Text
            as="span"
            className={cx(flexBalance >= 0 ? s.flexPositive : s.flexNegative)}
          >
            {flexBalance >= 0 ? "+" : ""}
            {fmtHours(flexBalance)}
          </prim.Text>
        </prim.Text>
      </prim.Stack>
    </prim.Stack>
  );
}
