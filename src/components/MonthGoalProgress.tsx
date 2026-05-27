import { useTranslation } from "../lib/i18n";
import { fmtHours } from "../lib/hours";
import * as prim from "../primitives";

interface Props {
  monthTotal: number;
  expectedMonthHours: number;
  monthDelta: number | null;
  flexBalance: number;
  workingDaysCount: number;
}

export function MonthGoalProgress({
  monthTotal,
  expectedMonthHours,
  monthDelta,
  flexBalance,
  workingDaysCount,
}: Props) {
  const { t } = useTranslation();
  const onTrack = monthTotal >= expectedMonthHours;
  const pct = Math.min(100, (monthTotal / expectedMonthHours) * 100);

  const deltaText =
    monthDelta == null
      ? ""
      : monthDelta === 0
        ? t("month.sameAsLast")
        : `${monthDelta > 0 ? "+" : ""}${fmtHours(monthDelta)} ${t("month.vsLast")}`;

  return (
    <prim.Stack gap="sm">
      <prim.Stack direction="row" justify="spaceBetween" align="baseline">
        <prim.MonoText size="2xs" weight="semibold" color="tertiary" transform="uppercase" tracking="loosest">
          {t("month.thisMonth")}
        </prim.MonoText>
        <prim.MonoText size="sm" weight="semibold" tabular>
          <prim.MonoText size="sm" weight="semibold" color={onTrack ? "green" : "primary"} tabular>
            {fmtHours(monthTotal)}
          </prim.MonoText>
          <prim.MonoText size="sm" weight="semibold" color="faint" tabular>
            {" / "}
            {fmtHours(expectedMonthHours)}
          </prim.MonoText>
        </prim.MonoText>
      </prim.Stack>

      <prim.ProgressBar value={pct / 100} size="thin" tone={onTrack ? "green" : "accent"} />

      {(monthDelta != null || workingDaysCount > 0) && (
        <prim.Stack direction="row" justify="spaceBetween" align="baseline" gap="md">
          <prim.DisplayText size="md" italic color="tertiary" leading="normal">
            {deltaText}
          </prim.DisplayText>
          {workingDaysCount > 0 && (
            <prim.MonoText size="xs" color="faint" tabular>
              <prim.MonoText size="xs" weight="semibold" color="faint" transform="uppercase" tracking="loosest">
                {t("week.flex")}{" "}
              </prim.MonoText>
              <prim.MonoText size="xs" weight="bold" color={flexBalance >= 0 ? "green" : "warning"}>
                {flexBalance >= 0 ? "+" : ""}
                {fmtHours(flexBalance)}
              </prim.MonoText>
            </prim.MonoText>
          )}
        </prim.Stack>
      )}
    </prim.Stack>
  );
}
