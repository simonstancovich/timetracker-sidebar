import { useTranslation } from "../lib/i18n";
import * as prim from "../primitives";
import * as s from "./WeekInsightCard.css";

interface Props {
  insight: string;
}

export function WeekInsightCard({ insight }: Props) {
  const { t } = useTranslation();
  return (
    <prim.Card tone="tinted" radius="lg" pad="lg">
      <prim.Text as="div" className={s.quote}>
        &ldquo;{insight}&rdquo;
      </prim.Text>
      <prim.Text as="div" className={s.attribution}>
        — {t("week.coachNote")} · {t("week.weeklyInsight")}
      </prim.Text>
    </prim.Card>
  );
}
