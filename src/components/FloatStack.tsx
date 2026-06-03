import * as prim from "../primitives";
import type { Float } from "../lib/useFloats";
import * as s from "./FloatStack.css";

interface Props {
  floats: Float[];
}

export function FloatStack({ floats }: Props) {
  if (floats.length === 0) return null;
  return (
    <prim.Stack
      aria-live="polite"
      position="absolute"
      align="center"
      justify="center"
      gap="sm"
      padding="lg"
      className={s.layer}
    >
      {floats.map((f) => (
        <prim.FloatToast key={f.id} role="status" color={f.col}>
          {f.txt}
        </prim.FloatToast>
      ))}
    </prim.Stack>
  );
}
