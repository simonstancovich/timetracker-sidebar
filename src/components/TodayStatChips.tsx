import { useTranslation } from "../lib/i18n";
import * as prim from "../primitives";
import { FlameIcon } from "../icons/FlameIcon";
import { CheckIcon } from "../icons/CheckIcon";
import { StatChip } from "./StatChip";
import * as s from "./TodayStatChips.css";

interface Props {
  streak: number;
  streakPopped: boolean;
  billablePercent: number;
  xp: number;
}

export function TodayStatChips({ streak, streakPopped, billablePercent, xp }: Props) {
  const { t } = useTranslation();
  return (
    <prim.Stack align="center" className={s.wrap}>
      <prim.Stack direction="row" justify="center" className={s.row}>
        <StatChip
          tone="pink"
          icon={<FlameIcon size={11} />}
          value={streak}
          label={t("today.stat.streak")}
          popped={streakPopped}
        />
        <StatChip
          tone="green"
          icon={<CheckIcon size={11} strokeWidth={2.5} />}
          value={`${billablePercent}%`}
          label={t("today.stat.billable")}
        />
      </prim.Stack>
      <StatChip tone="accent" value={xp} label={t("today.stat.xpToday")} />
    </prim.Stack>
  );
}
