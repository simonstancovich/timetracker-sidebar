import type { ReactNode } from "react";
import * as prim from "../primitives";
import { streakPop } from "../styles/celebration.css";
import * as s from "./StatChip.css";

export function StatChip({
  tone,
  icon,
  value,
  label,
  popped = false,
}: {
  tone: prim.BadgeTone;
  icon?: ReactNode;
  value: ReactNode;
  label: string;
  popped?: boolean;
}) {
  return (
    <prim.Badge tone={tone} className={popped ? streakPop : undefined}>
      {icon}
      <prim.MonoText size="sm" color={tone} tracking="wide">
        {value}
      </prim.MonoText>
      <prim.MonoText
        size="2xs"
        weight="semibold"
        color="secondary"
        transform="uppercase"
        className={s.labelTracking}
      >
        {label}
      </prim.MonoText>
    </prim.Badge>
  );
}
