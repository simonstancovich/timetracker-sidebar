import type { ReactNode } from "react";
import { DisplayText, MonoText, Stack } from "../primitives";
import type { DisplayTextColor } from "../primitives";

interface Props {
  value: ReactNode;
  unit?: string;
  unitColor?: DisplayTextColor;
  label: string;
}

export function MonthStat({ value, unit, unitColor = "accent", label }: Props) {
  return (
    <Stack gap="xs" align="center">
      <DisplayText size="4xl" align="center" tracking="tight" leading="none" tabular>
        {value}
        {unit && (
          <DisplayText size="xl" italic color={unitColor}>
            {unit}
          </DisplayText>
        )}
      </DisplayText>
      <MonoText
        size="2xs"
        weight="semibold"
        color="faint"
        transform="uppercase"
        tracking="loosest"
      >
        {label}
      </MonoText>
    </Stack>
  );
}
