import { Fragment } from "react";
import { useTranslation } from "../lib/i18n";
import { fmtHours } from "../lib/hours";
import * as prim from "../primitives";

interface Props {
  overtimeHours: number;
  longDayCount: number;
  weekendHours: number;
  workingDaysCount: number;
  goal: number;
}

export function MonthHeadsUp({
  overtimeHours,
  longDayCount,
  weekendHours,
  workingDaysCount,
  goal,
}: Props) {
  const { t } = useTranslation();

  const notes = [
    overtimeHours > 0
      ? `· ${fmtHours(overtimeHours)} ${t("week.overtime", { goal: fmtHours(workingDaysCount * goal) })}`
      : null,
    longDayCount > 0
      ? `· ${t(longDayCount === 1 ? "week.overTenDays" : "week.overTenDaysPlural", { n: longDayCount })}`
      : null,
    weekendHours > 0 ? `· ${fmtHours(weekendHours)} ${t("week.weekendHours")}` : null,
  ].filter((n): n is string => n != null);

  return (
    <prim.Stack gap="xs">
      <prim.MonoText size="2xs" weight="semibold" color="warning" transform="uppercase" tracking="loosest">
        {t("week.headsUp")}
      </prim.MonoText>
      <prim.Stack gap="none">
        {notes.map((note) => (
          <Fragment key={note}>
            <prim.DisplayText size="md" italic color="secondary" leading="loose">
              {note}
            </prim.DisplayText>
          </Fragment>
        ))}
      </prim.Stack>
    </prim.Stack>
  );
}
