import type { ReactNode } from "react";
import * as prim from "../primitives";

interface Props {
  value: ReactNode;
  unit?: string;
  unitColor?: prim.DisplayTextColor;
  label: string;
}

export function MonthStat({ value, unit, unitColor = "accent", label }: Props) {
  return (
    <prim.Stack gap="xs" align="center">
      <prim.DisplayText size="4xl" align="center" tracking="tight" leading="none" tabular>
        {value}
        {unit && (
          <prim.DisplayText size="xl" italic color={unitColor}>
            {unit}
          </prim.DisplayText>
        )}
      </prim.DisplayText>
      <prim.MonoText
        size="2xs"
        weight="semibold"
        color="faint"
        transform="uppercase"
        tracking="loosest"
      >
        {label}
      </prim.MonoText>
    </prim.Stack>
  );
}
