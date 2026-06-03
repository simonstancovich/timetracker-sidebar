import { vars } from "../theme";
import * as s from "./IntroDial.css";

interface Props {
  done: boolean;
}

const TICK_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];
const RING_RADIUS = 29;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// Animated watch-dial mark — sweeping ring + ticking hand, surrounded by tick
// marks. Switches to a green check when `done` (the final intro step).
export function IntroDial({ done }: Props) {
  const ringColor = done ? vars.typography.green : vars.typography.accent;
  return (
    <svg width={108} height={108} viewBox="0 0 64 64" aria-hidden>
      <circle cx="32" cy="32" r={RING_RADIUS} fill="none" stroke={vars.border.soft} strokeWidth={2.5} />
      {TICK_ANGLES.map((angle, i) => (
        <line
          key={angle}
          x1="32"
          y1="3.5"
          x2="32"
          y2={i % 2 === 0 ? 7 : 5.5}
          stroke={i % 2 === 0 ? vars.typography.tertiary : vars.typography.faint}
          strokeWidth={i % 2 === 0 ? 1.4 : 1}
          strokeLinecap="round"
          transform={`rotate(${angle} 32 32)`}
          opacity={0.7}
        />
      ))}
      <circle
        className={s.sweep}
        cx="32"
        cy="32"
        r={RING_RADIUS}
        fill="none"
        stroke={ringColor}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeDasharray={RING_CIRCUMFERENCE}
        strokeDashoffset={RING_CIRCUMFERENCE}
        transform="rotate(-90 32 32)"
      />
      {done ? (
        <polyline
          points="22 33 29 40 43 25"
          fill="none"
          stroke={vars.typography.green}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <g className={s.hand}>
          <line
            x1="32"
            y1="32"
            x2="32"
            y2="14"
            stroke={vars.typography.accent}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <circle cx="32" cy="32" r="3" fill={vars.typography.accent} />
        </g>
      )}
    </svg>
  );
}
