import { useTranslation } from "../lib/i18n";
import { fmtHours } from "../lib/hours";
import { vars } from "../theme";
import { DisplayText, MonoText, Stack } from "../primitives";

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
    <Stack gap="sm">
      <Stack direction="row" justify="spaceBetween" align="baseline">
        <MonoText size="2xs" weight="semibold" color="tertiary" transform="uppercase" tracking="loosest">
          {t("month.thisMonth")}
        </MonoText>
        <MonoText size="sm" weight="semibold" tabular>
          <MonoText size="sm" weight="semibold" color={onTrack ? "green" : "primary"} tabular>
            {fmtHours(monthTotal)}
          </MonoText>
          <MonoText size="sm" weight="semibold" color="faint" tabular>
            {" / "}
            {fmtHours(expectedMonthHours)}
          </MonoText>
        </MonoText>
      </Stack>

      <div style={{ height: 2, background: vars.border.soft, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: onTrack ? vars.typography.green : vars.typography.accent,
            transition: "width 500ms cubic-bezier(.22,1,.36,1)",
          }}
        />
      </div>

      {(monthDelta != null || workingDaysCount > 0) && (
        <Stack direction="row" justify="spaceBetween" align="baseline" gap="md">
          <DisplayText size="md" italic color="tertiary" leading="normal">
            {deltaText}
          </DisplayText>
          {workingDaysCount > 0 && (
            <MonoText size="xs" color="faint" tabular>
              <MonoText size="xs" weight="semibold" color="faint" transform="uppercase" tracking="loosest">
                {t("week.flex")}{" "}
              </MonoText>
              <MonoText size="xs" weight="bold" color={flexBalance >= 0 ? "green" : "warning"}>
                {flexBalance >= 0 ? "+" : ""}
                {fmtHours(flexBalance)}
              </MonoText>
            </MonoText>
          )}
        </Stack>
      )}
    </Stack>
  );
}
