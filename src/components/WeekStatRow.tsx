import { useTranslation } from "../lib/i18n";
import * as prim from "../primitives";
import * as s from "./WeekStatRow.css";

const fmtHours = (h: number) => {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${hh}:${String(mm).padStart(2, "0")}`;
};

interface Props {
  loaded: boolean;
  weekTotal: number;
  avgPerWorkday: number;
  billablePct: number;
}

export function WeekStatRow({ loaded, weekTotal, avgPerWorkday, billablePct }: Props) {
  const { t } = useTranslation();
  return (
    <prim.Grid columns={3} gap="sm" className={s.grid}>
      <prim.Stack align="center">
        <prim.Text as="div" align="center" className={s.value}>
          {loaded ? fmtHours(weekTotal) : "—"}
        </prim.Text>
        <prim.Text as="div" align="center" className={s.label}>
          {t("week.total")}
        </prim.Text>
      </prim.Stack>
      <prim.Stack align="center">
        <prim.Text as="div" align="center" className={s.value}>
          {loaded && avgPerWorkday > 0 ? avgPerWorkday.toFixed(1) : "—"}
          {loaded && avgPerWorkday > 0 && (
            <prim.Text as="span" className={s.valueSuffixAccent}>
              h
            </prim.Text>
          )}
        </prim.Text>
        <prim.Text as="div" align="center" className={s.label}>
          {t("week.avgDay")}
        </prim.Text>
      </prim.Stack>
      <prim.Stack align="center">
        <prim.Text as="div" align="center" className={s.value}>
          {loaded && weekTotal > 0 ? Math.round(billablePct) : "—"}
          {loaded && weekTotal > 0 && (
            <prim.Text as="span" className={s.valueSuffixGreen}>
              %
            </prim.Text>
          )}
        </prim.Text>
        <prim.Text as="div" align="center" className={s.label}>
          {t("week.billable")}
        </prim.Text>
      </prim.Stack>
    </prim.Grid>
  );
}
