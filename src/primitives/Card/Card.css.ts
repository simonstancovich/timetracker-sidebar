import { style, styleVariants } from "@vanilla-extract/css";
import { vars, radii, spacing } from "../../theme";

export const root = style({
  background: vars.background.surface,
  border: `1px solid ${vars.border.soft}`,
});

export const tone = styleVariants({
  default: {},
  // Tinted surface, soft border (no accent outline) — for insight panels.
  tinted: { background: vars.background.accent },
  // Active/editing: accent bg + accent border + ring.
  accent: {
    background: vars.background.accent,
    border: `1px solid ${vars.typography.accent}`,
    boxShadow: `0 0 0 1px color-mix(in srgb, ${vars.typography.accent} 20%, transparent)`,
  },
});

export const radius = styleVariants({
  lg: { borderRadius: radii.lg }, // 12
  xl: { borderRadius: radii.xl }, // 14
});

export const pad = styleVariants({
  none: { padding: 0 },
  sm: { padding: "10px 12px" },
  md: { padding: spacing.md }, // 12
  lg: { padding: "14px 16px" },
});
