import { keyframes, style } from "@vanilla-extract/css";
import { vars } from "../theme";

const driftIn = keyframes({
  from: { opacity: 0, transform: "translate(-50%, -50%) scale(0.7)" },
  to: { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
});

const zFloat = keyframes({
  "0%": { opacity: 0, transform: "translate(-50%, 0) scale(0.6)" },
  "20%": { opacity: 1 },
  "100%": { opacity: 0, transform: "translate(-50%, -20px) scale(1)" },
});

export const wanderer = style({
  selectors: {
    "&&": {
      position: "absolute",
      left: "var(--pet-x, 50%)",
      top: "var(--pet-y, 72%)",
      transform: "translate(-50%, -50%)",
      transition: "left var(--walk-ms, 0ms) linear, transform 160ms ease",
      background: "transparent",
      border: "none",
      padding: 4,
      borderRadius: 8,
      cursor: "pointer",
      zIndex: 4,
      pointerEvents: "auto",
      lineHeight: 0,
      animationName: driftIn,
      animationDuration: "320ms",
      animationFillMode: "both",
    },
    "&&:hover": {
      transform: "translate(-50%, -50%) scale(1.12)",
    },
    "&&:active": {
      transform: "translate(-50%, -50%) scale(0.95)",
    },
  },
});

export const walking = style({});

export const sleeping = style({});

export const zzz = style({
  position: "absolute",
  left: "50%",
  top: -8,
  transform: "translate(-50%, 0)",
  fontFamily: vars.font.display,
  fontStyle: "italic",
  fontSize: 18,
  lineHeight: 1,
  color: vars.typography.tertiary,
  pointerEvents: "none",
  animationName: zFloat,
  animationDuration: "2200ms",
  animationIterationCount: "infinite",
  animationTimingFunction: "ease-out",
});
