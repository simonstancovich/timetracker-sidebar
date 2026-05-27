import type { ReactNode } from "react";
import * as prim from "../primitives";
import { vars } from "../theme";
import { MONO } from "../lib/fonts";

// The hue's text colour matches the Badge tone.
const valueColor: Record<prim.BadgeTone, string> = {
  pink: vars.typography.pink,
  green: vars.typography.green,
  accent: vars.typography.accent,
};

// A Today stat chip: tinted Badge with an optional icon, a bold value, and a
// faint uppercase label.
export function StatChip({
  tone,
  icon,
  value,
  label,
  popped = false,
}: {
  tone: prim.BadgeTone;
  icon?: ReactNode;
  value: ReactNode;
  label: string;
  popped?: boolean;
}) {
  return (
    <prim.Badge tone={tone} className={popped ? "streak-pop" : undefined}>
      {icon}
      <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: valueColor[tone], letterSpacing: 0.3 }}>
        {value}
      </span>
      <span
        style={{
          fontFamily: MONO,
          fontSize: 9,
          fontWeight: 600,
          color: vars.typography.tertiary,
          textTransform: "uppercase",
          letterSpacing: 1.4,
        }}
      >
        {label}
      </span>
    </prim.Badge>
  );
}
