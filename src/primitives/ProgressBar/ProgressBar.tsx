import type { HTMLAttributes } from "react";
import { cx } from "../../lib/cx";
import * as s from "./ProgressBar.css";

export type ProgressBarTone = keyof typeof s.tone;
export type ProgressBarSize = keyof typeof s.trackSize;

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "role" | "style" | "children"> {
  value: number;
  tone?: ProgressBarTone;
  size?: ProgressBarSize;
  grow?: boolean;
}

export function ProgressBar({
  value,
  tone = "accent",
  size = "thin",
  grow = false,
  className,
  ...rest
}: Props) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      {...rest}
      className={cx(s.track, s.trackSize[size], grow && s.grow, className)}
    >
      <div
        className={cx(s.fill, s.fillMotion[size], s.tone[tone])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
