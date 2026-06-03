import { keyframes, style } from "@vanilla-extract/css";

const dialSweep = keyframes({
  "0%": { strokeDashoffset: 226 },
  "100%": { strokeDashoffset: 0 },
});

const handTick = keyframes({
  "0%": { transform: "rotate(0deg)" },
  "12%": { transform: "rotate(30deg)" },
  "24%": { transform: "rotate(60deg)" },
  "36%": { transform: "rotate(90deg)" },
  "48%": { transform: "rotate(120deg)" },
  "60%": { transform: "rotate(150deg)" },
  "72%": { transform: "rotate(180deg)" },
  "84%": { transform: "rotate(210deg)" },
  "100%": { transform: "rotate(240deg)" },
});

export const sweep = style({
  animationName: dialSweep,
  animationDuration: "2.4s",
  animationTimingFunction: "cubic-bezier(.22,1,.36,1)",
  animationFillMode: "forwards",
  "@media": {
    "(prefers-reduced-motion: reduce)": { animation: "none" },
  },
});

export const hand = style({
  transformOrigin: "32px 32px",
  animationName: handTick,
  animationDuration: "6s",
  animationTimingFunction: "steps(1)",
  animationIterationCount: "infinite",
  "@media": {
    "(prefers-reduced-motion: reduce)": { animation: "none" },
  },
});
