import type { ReactNode } from "react";
import * as prim from "../primitives";

interface Props {
  value: ReactNode;
  valueColor: prim.MonoTextColor;
  label: string;
}

// One inline summary pill: a bold coloured figure with a faint uppercase label.
export function MonthSummaryStat({ value, valueColor, label }: Props) {
  return (
    <prim.Stack direction="row" align="baseline" gap="xs">
      <prim.MonoText size="xs" weight="bold" color={valueColor} tabular>
        {value}
      </prim.MonoText>
      <prim.MonoText size="2xs" weight="normal" color="faint" transform="uppercase" tracking="loosest">
        {label}
      </prim.MonoText>
    </prim.Stack>
  );
}
