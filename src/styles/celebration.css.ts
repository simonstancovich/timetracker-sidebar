import { keyframes, style } from "@vanilla-extract/css";

const livePulse = keyframes({
  "0%":   { boxShadow: "0 0 0 0 var(--live-pulse-ring)" },
  "70%":  { boxShadow: "0 0 0 6px transparent" },
  "100%": { boxShadow: "0 0 0 0 transparent" },
});

export const livePulseAnim = style({
  animationName: livePulse,
  animationDuration: "1.6s",
  animationTimingFunction: "ease-out",
  animationIterationCount: "infinite",
});

export const livePulseDot = style([
  livePulseAnim,
  {
    display: "inline-block",
    borderRadius: "50%",
  },
]);

const streakPopAnim = keyframes({
  "0%":   { transform: "rotate(-10deg) scale(1)" },
  "22%":  { transform: "rotate(8deg) scale(1.18)" },
  "44%":  { transform: "rotate(-4deg) scale(0.96)" },
  "68%":  { transform: "rotate(2deg) scale(1.04)" },
  "100%": { transform: "rotate(0) scale(1)" },
});

export const streakPop = style({
  display: "inline-flex",
  animationName: streakPopAnim,
  animationDuration: "1.3s",
  animationTimingFunction: "cubic-bezier(.34,1.4,.64,1)",
  transformOrigin: "center",
});

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
