import type { ReactNode } from "react";
import { cx } from "../../lib/cx";
import * as s from "./Card.css";

export type CardTone = keyof typeof s.tone;
export type CardRadius = keyof typeof s.radius;
export type CardPad = keyof typeof s.pad;

// Bordered, rounded surface. The base for panels, insight cards, and FormCard.
export function Card({
  tone = "default",
  radius = "lg",
  pad = "md",
  className,
  children,
}: {
  tone?: CardTone;
  radius?: CardRadius;
  pad?: CardPad;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cx(s.root, s.tone[tone], s.radius[radius], s.pad[pad], className)}>
      {children}
    </div>
  );
}
