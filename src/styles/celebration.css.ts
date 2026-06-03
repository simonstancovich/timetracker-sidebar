import { keyframes, style } from "@vanilla-extract/css";

// Shared "just hit goal" celebration animation. Applied to the hours ring
// button in the top bar and the giant hours number on Today.
const goalBloom = keyframes({
  "0%": { transform: "scale(1)", filter: "drop-shadow(0 0 0 transparent)" },
  "35%": {
    transform: "scale(1.28)",
    filter: "drop-shadow(0 0 14px rgba(111,212,160,0.65))",
  },
  "70%": {
    transform: "scale(1.06)",
    filter: "drop-shadow(0 0 6px rgba(111,212,160,0.35))",
  },
  "100%": { transform: "scale(1)", filter: "drop-shadow(0 0 0 transparent)" },
});

export const bloom = style({
  display: "inline-block",
  animationName: goalBloom,
  animationDuration: "1.6s",
  animationTimingFunction: "cubic-bezier(.34,1.56,.64,1)",
  transformOrigin: "center",
});
