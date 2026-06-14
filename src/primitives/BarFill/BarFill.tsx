import { forwardRef, type CSSProperties, type HTMLAttributes } from "react";
import { cx } from "../../lib/cx";
import * as s from "./BarFill.css";

export type BarFillTone = keyof typeof s.tone;

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "style" | "children"> {
  fraction: number;
  tone?: BarFillTone;
  active?: boolean;
}

export const BarFill = forwardRef<HTMLDivElement, Props>(function BarFill(
  { fraction, tone = "partial", active = false, className, ...rest },
  ref,
) {
  const pct = Math.max(0, Math.min(1, fraction)) * 100;
  // Owns the one dynamic dimension a styleVariant can't express, exactly like ProgressFill's width.
  return (
    <div
      ref={ref}
      aria-hidden
      {...rest}
      className={cx(s.root, s.tone[tone], active && s.active, className)}
      style={{ height: `${pct}%` } as CSSProperties}
    />
  );
});
