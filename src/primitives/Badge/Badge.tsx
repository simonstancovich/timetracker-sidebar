import type { ReactNode } from "react";
import { cx } from "../../lib/cx";
import * as s from "./Badge.css";

export type BadgeTone = keyof typeof s.tone;

// Tinted stat chip. Carries the engrave shadow; the icon/value/label content
// is composed by the caller.
export function Badge({
  tone,
  className,
  children,
}: {
  tone: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return <span className={cx(s.root, s.tone[tone], "engrave-card", className)}>{children}</span>;
}
