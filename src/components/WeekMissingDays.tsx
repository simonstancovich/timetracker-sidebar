import { useTranslation } from "../lib/i18n";
import { dateKey } from "../lib/swedishHolidays";
import * as prim from "../primitives";
import * as s from "./WeekMissingDays.css";

interface Props {
  days: Date[];
  locale: string;
  onBackfill: (d: Date) => void;
}

export function WeekMissingDays({ days, locale, onBackfill }: Props) {
  const { t } = useTranslation();
  if (days.length === 0) return null;
  return (
    <prim.Stack className={s.wrap}>
      <prim.Text as="div" className={s.eyebrow}>
        {days.length === 1
          ? t("week.daysWithoutEntries", { n: 1 })
          : t("week.daysWithoutEntriesPlural", { n: days.length })}
      </prim.Text>
      <prim.Stack className={s.row}>
        {days.map((d) => (
          <prim.Button
            key={dateKey(d)}
            variant="link"
            onClick={() => onBackfill(d)}
            title={d.toLocaleDateString(locale, {
              weekday: "long",
              day: "numeric",
              month: "short",
            })}
            className={s.chip}
          >
            {d.toLocaleDateString(locale, { weekday: "short", day: "numeric" })}
          </prim.Button>
        ))}
      </prim.Stack>
    </prim.Stack>
  );
}
