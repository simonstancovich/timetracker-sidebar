import { Fragment } from "react";
import { useTranslation } from "../lib/i18n";
import { fmtHours } from "../lib/hours";
import { DisplayText, MonoText, Stack } from "../primitives";

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
    <Stack gap="xs">
      <MonoText size="2xs" weight="semibold" color="warning" transform="uppercase" tracking="loosest">
        {t("week.headsUp")}
      </MonoText>
      <Stack gap="none">
        {notes.map((note) => (
          <Fragment key={note}>
            <DisplayText size="md" italic color="secondary" leading="loose">
              {note}
            </DisplayText>
          </Fragment>
        ))}
      </Stack>
    </Stack>
  );
}
