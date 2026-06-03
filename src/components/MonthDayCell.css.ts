import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../theme";

export const cell = style({
  aspectRatio: "1 / 1",
  borderRadius: 8,
  padding: 2,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 1,
  cursor: "pointer",
  position: "relative",
  transition: "all 140ms ease",
  background: "transparent",
  border: `1px solid transparent`,
  fontFamily: "inherit",
  fontWeight: "inherit",
  boxShadow: "none",
});

export const tone = styleVariants({
  today: {
    background: `color-mix(in srgb, ${vars.typography.accent} 10%, transparent)`,
    border: `1.5px solid ${vars.typography.accent}`,
  },
  goal: {
    border: `1px solid color-mix(in srgb, ${vars.typography.green} 40%, transparent)`,
  },
  partial: {
    background: `color-mix(in srgb, ${vars.typography.soon} 12%, transparent)`,
    border: `1px solid color-mix(in srgb, ${vars.typography.soon} 45%, transparent)`,
  },
  missed: {
    background: `color-mix(in srgb, ${vars.typography.error} 8%, transparent)`,
    border: `1px solid color-mix(in srgb, ${vars.typography.error} 35%, transparent)`,
  },
  workday: {
    border: `1px solid ${vars.border.soft}`,
  },
  off: {
    border: `1px dashed ${vars.border.soft}`,
  },
});

export const heat = styleVariants({
  "20": { background: `color-mix(in srgb, ${vars.typography.green} 20%, transparent)` },
  "30": { background: `color-mix(in srgb, ${vars.typography.green} 30%, transparent)` },
  "40": { background: `color-mix(in srgb, ${vars.typography.green} 40%, transparent)` },
  "50": { background: `color-mix(in srgb, ${vars.typography.green} 50%, transparent)` },
  "60": { background: `color-mix(in srgb, ${vars.typography.green} 60%, transparent)` },
});

export const dayNumber = style({
  fontFamily: vars.font.display,
  fontSize: 18,
  lineHeight: 1,
  fontVariantNumeric: "tabular-nums",
  letterSpacing: -0.4,
});

export const hoursLabel = style({
  fontSize: 9,
  fontWeight: 700,
  lineHeight: 1,
  fontVariantNumeric: "tabular-nums",
  letterSpacing: 0.3,
});

export const skeletonCell = style({
  aspectRatio: "1 / 1",
  borderRadius: 8,
});
