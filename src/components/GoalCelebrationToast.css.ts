import { keyframes, style, styleVariants } from "@vanilla-extract/css";
import { vars, zIndex } from "../theme";

const goalToastIn = keyframes({
  "0%": { opacity: 0, transform: "translateY(24px) scale(.94)" },
  "60%": { opacity: 1, transform: "translateY(-4px) scale(1.02)" },
  "100%": { opacity: 1, transform: "translateY(0) scale(1)" },
});

export const toast = style({
  position: "absolute",
  left: 12,
  right: 12,
  gap: 13,
  background: vars.background.surface,
  border: `1.5px solid color-mix(in srgb, ${vars.typography.green} 40%, transparent)`,
  borderRadius: 14,
  padding: "14px 16px",
  zIndex: zIndex.goalToast,
  boxShadow: `0 10px 36px color-mix(in srgb, ${vars.typography.green} 33%, transparent)`,
  animationName: goalToastIn,
  animationDuration: ".6s",
  animationTimingFunction: "cubic-bezier(.34,1.56,.64,1)",
});

export const toastOffset = styleVariants({
  default: { bottom: 14 },
  lifted: { bottom: 90 },
});

export const iconTile = style({
  width: 44,
  height: 44,
  borderRadius: 12,
  background: `color-mix(in srgb, ${vars.typography.green} 12%, transparent)`,
  color: vars.typography.green,
  flexShrink: 0,
  boxShadow: "none",
});
