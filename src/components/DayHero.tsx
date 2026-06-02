import { fmtHours } from "../lib/hours";
import { cx } from "../lib/cx";
import * as prim from "../primitives";
import * as s from "./DayHero.css";

interface Props {
  hours: number;
  goalReached: boolean;
  subtitle: string;
}

export function DayHero({ hours, goalReached, subtitle }: Props) {
  const [whole, frac] = fmtHours(hours).split(":");
  const tone = goalReached ? "goal" : "inProgress";
  return (
    <prim.Stack className={s.wrap}>
      <prim.Text as="span" className={cx(s.numberBase, s.numberColor[tone])}>
        {whole}
        <prim.Stack as="span" inline aria-hidden className={s.colonAnchor}>
          <prim.Stack as="span" inline className={s.dot}>{null}</prim.Stack>
          <prim.Stack as="span" inline className={s.dot}>{null}</prim.Stack>
        </prim.Stack>
        {frac}
        <prim.Text as="span" className={cx(s.suffixBase, s.suffixColor[tone])}>
          h
        </prim.Text>
      </prim.Text>
      <prim.Text as="span" className={s.subtitle}>
        {subtitle}
      </prim.Text>
    </prim.Stack>
  );
}
