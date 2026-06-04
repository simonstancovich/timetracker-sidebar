import { useTranslation } from "../lib/i18n";
import { fmtHours } from "../lib/hours";
import { cx } from "../lib/cx";
import * as prim from "../primitives";
import * as s from "./TimerStatsStrip.css";

interface Props {
  sessXP: number;
  todayHours: number;
  streak: number;
  goalReached: boolean;
}

export function TimerStatsStrip({ sessXP, todayHours, streak, goalReached }: Props) {
  const { t } = useTranslation();
  return (
    <prim.Grid columns={3} gap="sm" data-tour="timer-stats" className={s.grid}>
      <prim.Stack>
        <prim.Text as="div" className={cx(s.big, s.bigPrimary)}>
          +{sessXP}
        </prim.Text>
        <prim.Text as="div" className={s.label}>
          {t("timer.statSessionXp")}
        </prim.Text>
      </prim.Stack>
      <prim.Stack>
        <prim.Text as="div" className={cx(s.big, goalReached ? s.bigGreen : s.bigPrimary)}>
          {fmtHours(todayHours)}
        </prim.Text>
        <prim.Text as="div" className={s.label}>
          {t("timer.statToday")}
        </prim.Text>
      </prim.Stack>
      <prim.Stack>
        <prim.Text as="div" className={cx(s.big, s.bigPink)}>
          {streak}
          <prim.Text as="span" className={s.streakUnit}>
            d
          </prim.Text>
        </prim.Text>
        <prim.Text as="div" className={s.label}>
          {t("timer.statStreak")}
        </prim.Text>
      </prim.Stack>
    </prim.Grid>
  );
}
