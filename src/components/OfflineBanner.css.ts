import { keyframes, style, styleVariants } from "@vanilla-extract/css";
import { fontSize, fontWeight, letterSpacing, vars } from "../theme";

const pulse = keyframes({
  "0%, 100%": { opacity: 1 },
  "50%": { opacity: 0.55 },
});

export const banner = style({
  gap: 7,
  padding: "7px 14px",
  fontFamily: vars.font.mono,
  fontSize: fontSize.xs,
  fontWeight: fontWeight.bold,
  letterSpacing: letterSpacing.wider,
});

export const tone = styleVariants({
  sync: {
    background: `color-mix(in srgb, ${vars.typography.accent} 10%, transparent)`,
    borderTop: `1px solid color-mix(in srgb, ${vars.typography.accent} 25%, transparent)`,
    borderBottom: `1px solid color-mix(in srgb, ${vars.typography.accent} 25%, transparent)`,
    color: vars.typography.accent,
  },
  offline: {
    background: `color-mix(in srgb, ${vars.typography.warning} 10%, transparent)`,
    borderTop: `1px solid color-mix(in srgb, ${vars.typography.warning} 25%, transparent)`,
    borderBottom: `1px solid color-mix(in srgb, ${vars.typography.warning} 25%, transparent)`,
    color: vars.typography.warningInk,
  },
});

export const dot = style({
  width: 6,
  height: 6,
  borderRadius: "50%",
  flexShrink: 0,
});

export const dotTone = styleVariants({
  sync: { background: vars.typography.accent },
  offline: { background: vars.typography.warning },
});

export const dotPulsing = style({
  animationName: pulse,
  animationDuration: "1.2s",
  animationTimingFunction: "ease-in-out",
  animationIterationCount: "infinite",
});
