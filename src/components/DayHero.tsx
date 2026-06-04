import { fmtHours } from "../lib/hours";
import { cx } from "../lib/cx";
import * as prim from "../primitives";
import { bloom as bloomClass } from "../styles/celebration.css";
import * as s from "./DayHero.css";

interface Props {
  hours: number;
  goalReached: boolean;
  subtitle: string;
  variant?: "day" | "today";
  bloom?: boolean;
  "data-tour"?: string;
}

export function DayHero({
  hours,
  goalReached,
  subtitle,
  variant = "day",
  bloom = false,
  "data-tour": dataTour,
}: Props) {
  const [whole = "0", frac = "00"] = fmtHours(hours).split(":");
  const tone = goalReached ? "goal" : "inProgress";
  return (
    <prim.Stack align="center" data-tour={dataTour} className={cx(s.wrap, s.wrapPadding[variant])}>
      <prim.Text
        as="span"
        className={cx(
          s.numberBase,
          s.numberSize[variant],
          s.numberColor[tone],
          bloom && bloomClass,
        )}
      >
        {whole}
        <prim.Stack as="span" inline aria-hidden className={s.colonAnchor}>
          {[0, 1].map((i) => (
            <prim.Stack key={i} as="span" inline className={s.dot}>{null}</prim.Stack>
          ))}
        </prim.Stack>
        {frac}
        <prim.Text
          as="span"
          className={cx(s.suffixBase, s.suffixSize[variant], s.suffixColor[tone])}
        >
          h
        </prim.Text>
      </prim.Text>
      <prim.Text as="span" className={cx(s.subtitleBase, s.subtitleSize[variant])}>
        {subtitle}
      </prim.Text>
    </prim.Stack>
  );
}
