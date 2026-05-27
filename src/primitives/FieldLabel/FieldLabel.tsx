import type { ReactNode } from "react";
import { cx } from "../../lib/cx";
import * as s from "./FieldLabel.css";

export type FieldLabelTone = keyof typeof s.tone;

// The mono uppercase micro-caption that labels a form field.
export function FieldLabel({
  tone = "faint",
  className,
  children,
}: {
  tone?: FieldLabelTone;
  className?: string;
  children: ReactNode;
}) {
  return <label className={cx(s.root, s.tone[tone], className)}>{children}</label>;
}
