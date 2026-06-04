import { useTranslation } from "../lib/i18n";
import { fmtHours } from "../lib/hours";
import { cx } from "../lib/cx";
import * as prim from "../primitives";
import * as s from "./TodayTotalFooter.css";

interface Props {
  hours: number;
  goalReached: boolean;
}

export function TodayTotalFooter({ hours, goalReached }: Props) {
  const { t } = useTranslation();
  return (
    <prim.Stack direction="row" className={s.wrap}>
      <prim.Text as="span" className={s.label}>
        {t("today.totalLabel")}
      </prim.Text>
      <prim.Text
        as="span"
        className={cx(s.valueBase, goalReached ? s.valueDone : s.valueAccent)}
      >
        {fmtHours(hours)}
      </prim.Text>
    </prim.Stack>
  );
}
