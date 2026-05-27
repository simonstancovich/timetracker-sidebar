import { cx } from "../../lib/cx";
import * as s from "./ProgressBar.css";

export type ProgressBarTone = keyof typeof s.tone;
export type ProgressBarSize = keyof typeof s.trackSize;

// A track with a width-animated fill. `value` is 0–1 (the fill width is dynamic
// data, so it's the one inline style); everything visual is token-driven.
export function ProgressBar({
  value,
  tone = "accent",
  size = "thin",
  grow = false,
  className,
}: {
  value: number;
  tone?: ProgressBarTone;
  size?: ProgressBarSize;
  grow?: boolean;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className={cx(s.track, s.trackSize[size], grow && s.grow, className)}>
      <div
        className={cx(s.fill, s.fillMotion[size], s.tone[tone])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
