import type { ReactNode } from "react";
import { cx } from "../../lib/cx";
import * as s from "./ActivityRing.css";

interface Props {
  progress: number;
  done: boolean;
  size?: number;
  stroke?: number;
  withTicks?: boolean;
  children: ReactNode;
  className?: string;
}

const TICK_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315] as const;

export function ActivityRing({
  progress,
  done,
  size = 38,
  stroke = 3,
  withTicks = false,
  children,
  className,
}: Props) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, progress));
  const offset = circ * (1 - clamped);
  const center = size / 2;
  const tickOffset = stroke + 0.5;
  const majorLen = Math.max(1.5, size * 0.05);
  const minorLen = Math.max(1, size * 0.035);
  return (
    <div
      className={cx(s.root, className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className={s.svg} aria-hidden>
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className={s.track}
        />
        {withTicks && (
          <g>
            {TICK_ANGLES.map((angle, i) => {
              const isMajor = i % 2 === 0;
              const len = isMajor ? majorLen : minorLen;
              return (
                <line
                  key={angle}
                  x1={center}
                  y1={tickOffset}
                  x2={center}
                  y2={tickOffset + len}
                  className={isMajor ? s.tickMajor : s.tick}
                  transform={`rotate(${angle} ${center} ${center})`}
                />
              );
            })}
          </g>
        )}
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className={done ? s.ringDone : s.ring}
        />
      </svg>
      <div className={s.content}>{children}</div>
    </div>
  );
}
