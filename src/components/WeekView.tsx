import { useMemo } from "react";
import { useTranslation, type Lang } from "../lib/i18n";
import { weekInsight } from "../lib/personality";
import type { MonthClosureCache } from "../lib/useMonthClosure";
import * as prim from "../primitives";
import { WeekDayGrid } from "./WeekDayGrid";
import { WeekStatRow } from "./WeekStatRow";
import { WeekGoalProgress } from "./WeekGoalProgress";
import { WeekHeadsUp } from "./WeekHeadsUp";
import { WeekPerClient } from "./WeekPerClient";
import { WeekMissingDays } from "./WeekMissingDays";
import { WeekInsightCard } from "./WeekInsightCard";
import { useWeekData } from "./useWeekData";
import * as s from "./WeekView.css";

interface Props {
  goal: number;
  referenceDate: Date;
  onPickDay: (d: Date) => void;
  onBackfillDay?: (d: Date) => void;
  firstName?: string;
  monthClosure?: MonthClosureCache;
}

export function WeekView({
  goal,
  referenceDate,
  onPickDay,
  onBackfillDay,
  firstName,
  monthClosure,
}: Props) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Lang;
  const locale = lang === "sv" ? "sv-SE" : "en-GB";
  const data = useWeekData(referenceDate, goal, monthClosure);

  const insight = useMemo(
    () =>
      weekInsight({
        weekTotal: data.weekTotal,
        weeklyGoal: data.weeklyGoal,
        hit: data.hitGoalDays,
        workDayCount: data.workDayCount,
        billable: data.billable,
        prevWeekTotal: data.weekDelta != null ? data.weekTotal - data.weekDelta : null,
        bestDayName: data.bestDay
          ? data.bestDay.date.toLocaleDateString(locale, { weekday: "long" })
          : null,
        bestDayHours: data.bestDay?.hours,
        topClientName: data.topClient?.name,
        topClientShare:
          data.topClient && data.weekTotal > 0
            ? data.topClient.hours / data.weekTotal
            : undefined,
        firstName,
        isFinished: data.isFinished,
        lang,
      }),
    [data, locale, firstName, lang],
  );

  const onMissingDay = onBackfillDay ?? onPickDay;

  return (
    <prim.Stack className={s.page}>
      <WeekDayGrid
        dates={data.weekDates}
        hoursByDate={data.hoursByDate}
        holidays={data.holidays}
        goal={goal}
        loaded={data.loaded}
        locale={locale}
        todayKey={data.todayKey}
        onPickDay={onPickDay}
      />

      <WeekStatRow
        loaded={data.loaded}
        weekTotal={data.weekTotal}
        avgPerWorkday={data.avgPerWorkday}
        billablePct={data.billablePct}
      />

      {data.loaded && data.weeklyGoal > 0 && (
        <WeekGoalProgress
          weekTotal={data.weekTotal}
          weeklyGoal={data.weeklyGoal}
          weekDelta={data.weekDelta}
          flexBalance={data.flexBalance}
        />
      )}

      {data.loaded && (
        <WeekHeadsUp
          overtimeHours={data.overtimeHours}
          weeklyGoal={data.weeklyGoal}
          weekendHours={data.weekendHours}
          longDays={data.longDays}
          locale={locale}
        />
      )}

      <WeekPerClient loaded={data.loaded} clients={data.clientTotals} />

      {data.loaded && (
        <WeekMissingDays
          days={data.missingDays}
          locale={locale}
          onBackfill={onMissingDay}
        />
      )}

      {data.loaded && insight && <WeekInsightCard insight={insight} />}

      {data.loading && data.loaded && (
        <prim.Text as="div" className={s.refreshHint}>
          {t("week.refreshing")}
        </prim.Text>
      )}
    </prim.Stack>
  );
}
