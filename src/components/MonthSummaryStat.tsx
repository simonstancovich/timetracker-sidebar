import type { ReactNode } from "react";
import { MonoText, Stack } from "../primitives";
import type { MonoTextColor } from "../primitives";

interface Props {
  value: ReactNode;
  valueColor: MonoTextColor;
  label: string;
}

// One inline summary pill: a bold coloured figure with a faint uppercase label.
export function MonthSummaryStat({ value, valueColor, label }: Props) {
  return (
    <Stack direction="row" align="baseline" gap="xs">
      <MonoText size="xs" weight="bold" color={valueColor} tabular>
        {value}
      </MonoText>
      <MonoText size="2xs" weight="normal" color="faint" transform="uppercase" tracking="loosest">
        {label}
      </MonoText>
    </Stack>
  );
}
