import { vars } from "../theme";

export type ModeTransitionPhase = "idle" | "out" | "in";

interface Props {
  phase: ModeTransitionPhase;
}

// Full-viewport backdrop that fades to the theme background while the main
// process resizes the window between full and top-bar modes. Hides the resize
// jank without blocking input outside the "out" phase.
export function ModeTransitionOverlay({ phase }: Props) {
  const isOut = phase === "out";
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        background: vars.background.page,
        zIndex: 999,
        pointerEvents: isOut ? "auto" : "none",
        opacity: isOut ? 1 : 0,
        transition: "opacity 180ms ease-out",
      }}
    />
  );
}
