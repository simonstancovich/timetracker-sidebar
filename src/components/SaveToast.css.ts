import { keyframes, style } from "@vanilla-extract/css";
import { vars, zIndex } from "../theme";

const flashBackdrop = keyframes({
  "0%": { opacity: 0, backdropFilter: "blur(0px)", WebkitBackdropFilter: "blur(0px)" },
  "14%": { opacity: 1, backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" },
  "86%": { opacity: 1, backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" },
  "100%": { opacity: 0, backdropFilter: "blur(0px)", WebkitBackdropFilter: "blur(0px)" },
});

const flashCard = keyframes({
  "0%": { opacity: 0, transform: "scale(.88) rotate(-1.6deg)" },
  "18%": { opacity: 1, transform: "scale(1.02) rotate(0.4deg)" },
  "30%": { transform: "scale(1) rotate(0)" },
  "86%": { opacity: 1, transform: "scale(1) rotate(0)" },
  "100%": { opacity: 0, transform: "scale(.985) rotate(0)" },
});

const ringDraw = keyframes({
  "0%": { strokeDashoffset: 195 },
  "100%": { strokeDashoffset: 0 },
});

const checkDraw = keyframes({
  "0%": { strokeDashoffset: 40 },
  "100%": { strokeDashoffset: 0 },
});

export const backdrop = style({
  inset: 0,
  background: vars.background.saveScrim,
  zIndex: zIndex.saveToast,
  pointerEvents: "none",
  animationName: flashBackdrop,
  animationDuration: "2.1s",
  animationTimingFunction: "cubic-bezier(.22,1,.36,1)",
  animationFillMode: "forwards",
});

export const card = style({
  gap: 14,
  padding: "26px 30px 24px",
  borderRadius: 22,
  background: vars.background.surface,
  border: `1.5px solid color-mix(in srgb, ${vars.typography.green} 33%, transparent)`,
  boxShadow: `0 14px 48px color-mix(in srgb, ${vars.typography.green} 33%, transparent), 0 0 0 1px color-mix(in srgb, ${vars.typography.green} 13%, transparent)`,
  backdropFilter: "blur(18px) saturate(130%)",
  WebkitBackdropFilter: "blur(18px) saturate(130%)",
  animationName: flashCard,
  animationDuration: "2.1s",
  animationTimingFunction: "cubic-bezier(.22,1,.36,1)",
  animationFillMode: "forwards",
});

export const ring = style({
  animationName: ringDraw,
  animationDuration: "720ms",
  animationDelay: "220ms",
  animationTimingFunction: "cubic-bezier(.22,1,.36,1)",
  animationFillMode: "both",
});

export const check = style({
  animationName: checkDraw,
  animationDuration: "620ms",
  animationDelay: "820ms",
  animationTimingFunction: "cubic-bezier(.22,1,.36,1)",
  animationFillMode: "both",
});
