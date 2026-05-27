import { cx } from "../../lib/cx";
import * as s from "./Divider.css";

export type DividerTone = keyof typeof s.tone;

// A 1px hairline rule. `grow` makes it flex-fill a row.
export function Divider({
  tone = "soft",
  grow = false,
  className,
}: {
  tone?: DividerTone;
  grow?: boolean;
  className?: string;
}) {
  return <div aria-hidden className={cx(s.root, s.tone[tone], grow && s.grow, className)} />;
}
