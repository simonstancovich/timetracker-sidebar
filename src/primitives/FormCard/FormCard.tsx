import type { ReactNode } from "react";
import { cx } from "../../lib/cx";
import { Card } from "../Card/Card";
import * as s from "./FormCard.css";

// Card preset that stacks a form's fields. `accent` raises it to the
// active/editing treatment.
export function FormCard({
  accent = false,
  className,
  children,
}: {
  accent?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card tone={accent ? "accent" : "default"} pad="md" className={cx(s.stack, className)}>
      {children}
    </Card>
  );
}
