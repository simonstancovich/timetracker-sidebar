import type { ReactNode } from "react";
import * as prim from "../primitives";

interface Props {
  value: ReactNode;
  valueColor: prim.MonoTextColor;
  label: string;
}

export function MonthSummaryStat({ value, valueColor, label }: Props) {
  return (
    <prim.Stack direction="row" align="baseline" gap="xs">
      <prim.MonoText size="xs" color={valueColor} tabular>
        {value}
      </prim.MonoText>
      <prim.MonoText size="2xs" weight="normal" color="faint" transform="uppercase" tracking="loosest">
        {label}
      </prim.MonoText>
    </prim.Stack>
  );
}
