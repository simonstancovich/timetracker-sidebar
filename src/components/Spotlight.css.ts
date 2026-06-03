import { keyframes, style } from "@vanilla-extract/css";
import { zIndex } from "../theme";

// Pulsing ring around the highlighted target during the chapter tour.
const ringPulse = keyframes({
  "0%, 100%": {
    boxShadow:
      "0 0 0 4px rgba(232,148,114,0.22), 0 0 22px rgba(232,148,114,0.42)",
  },
  "50%": {
    boxShadow:
      "0 0 0 7px rgba(232,148,114,0.12), 0 0 32px rgba(232,148,114,0.62)",
  },
});

export const mask = style({
  position: "fixed",
  background: "rgba(0, 0, 0, 0.62)",
  zIndex: zIndex.introMask,
  pointerEvents: "auto",
});

export const block = style({
  position: "fixed",
  background: "transparent",
  zIndex: zIndex.introMask,
  pointerEvents: "auto",
  cursor: "not-allowed",
});

export const ring = style({
  position: "fixed",
  borderRadius: 10,
  pointerEvents: "none",
  zIndex: zIndex.introHighlight,
  animationName: ringPulse,
  animationDuration: "1.8s",
  animationTimingFunction: "ease-in-out",
  animationIterationCount: "infinite",
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      animation: "none",
    },
  },
});
