import { useTranslation } from "../lib/i18n";
import { cx } from "../lib/cx";
import * as prim from "../primitives";
import * as s from "./WeekPerClient.css";

type ChartKey = keyof typeof s.stripeChart;

const fmtHours = (h: number) => {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${hh}:${String(mm).padStart(2, "0")}`;
};

interface ClientTotal {
  name: string;
  hours: number;
}

interface Props {
  loaded: boolean;
  clients: ClientTotal[];
}

export function WeekPerClient({ loaded, clients }: Props) {
  const { t } = useTranslation();
  if (!loaded) {
    return (
      <prim.Stack className={s.skeletonStack}>
        <prim.Skeleton radius="xs" className={s.skeletonLabel} />
        <prim.Skeleton radius="xs" className={s.skeletonRow} />
        <prim.Skeleton radius="xs" className={s.skeletonRow} />
      </prim.Stack>
    );
  }
  if (clients.length === 0) return null;
  return (
    <prim.Stack className={s.wrap}>
      <prim.Text as="div" className={s.eyebrow}>
        {t("week.perClient")}
      </prim.Text>
      {clients.map((c, gi) => {
        const chartKey = (gi % 4) as ChartKey;
        return (
          <prim.Stack key={c.name} className={s.row}>
            <prim.Stack as="span" inline className={cx(s.stripe, s.stripeChart[chartKey])}>
              {null}
            </prim.Stack>
            <prim.ChartLabel colorIndex={gi} className={s.name}>
              {c.name}
            </prim.ChartLabel>
            <prim.Text as="span" className={s.hours}>
              {fmtHours(c.hours)}
            </prim.Text>
          </prim.Stack>
        );
      })}
    </prim.Stack>
  );
}
