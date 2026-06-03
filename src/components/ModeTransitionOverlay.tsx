import { cx } from "../lib/cx";
import * as prim from "../primitives";
import * as s from "./ModeTransitionOverlay.css";

export type ModeTransitionPhase = "idle" | "out" | "in";

interface Props {
  phase: ModeTransitionPhase;
}

export function ModeTransitionOverlay({ phase }: Props) {
  return (
    <prim.Stack
      aria-hidden
      position="fixed"
      className={cx(s.root, phase === "out" ? s.state.out : s.state.hidden)}
    >
      {null}
    </prim.Stack>
  );
}
