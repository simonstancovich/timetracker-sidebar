import type { ReactNode } from "react";
import { FieldLabel, type FieldLabelTone } from "../FieldLabel/FieldLabel";

// A labelled form field: the mono micro-caption stacked over its control.
export function Field({
  label,
  tone,
  children,
}: {
  label: string;
  tone?: FieldLabelTone;
  children: ReactNode;
}) {
  return (
    <div>
      <FieldLabel tone={tone}>{label}</FieldLabel>
      {children}
    </div>
  );
}
