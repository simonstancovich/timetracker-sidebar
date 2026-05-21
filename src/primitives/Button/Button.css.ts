import { style, styleVariants } from "@vanilla-extract/css";
import {
  vars,
  fontSize,
  fontWeight,
  letterSpacing,
  radii,
  spacing,
  transitions,
  opacity,
} from "../../theme";

export const root = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: vars.font.body,
  fontWeight: fontWeight.bold,
  border: "none",
  cursor: "pointer",
  transition: transitions.interactive,
  selectors: {
    "&:disabled": { cursor: "not-allowed", opacity: opacity.disabled },
  },
});

export const variant = styleVariants({
  primary: {
    background: vars.typography.accent,
    color: vars.typography.onAccent,
    boxShadow: vars.shadow.brand,
  },
  success: {
    background: vars.typography.green,
    color: vars.typography.onAccent,
    boxShadow: vars.shadow.brand,
  },
  secondary: {
    background: vars.background.raised,
    color: vars.typography.secondary,
    border: `1px solid ${vars.border.soft}`,
  },
  link: {
    background: "transparent",
    color: vars.typography.faint,
    padding: 0,
    borderRadius: 0,
    boxShadow: "none",
    fontWeight: fontWeight.normal,
  },
});

export const size = styleVariants({
  xs: {
    padding: `${spacing.xs}px ${spacing.sm}px`,
    fontSize: fontSize.xs,
    borderRadius: radii.xs,
  },
  sm: {
    padding: `${spacing.sm}px ${spacing.md}px`,
    fontSize: fontSize.sm,
    borderRadius: radii.sm,
  },
  md: {
    padding: `${spacing.md}px ${spacing.xl}px`,
    fontSize: fontSize.lg,
    borderRadius: radii.lg,
  },
});

export const shape = styleVariants({
  default: {},
  pill: { borderRadius: radii.pill },
});

// Editorial CTA label treatment: monospace, uppercase, wide tracking.
export const mono = style({
  fontFamily: vars.font.mono,
  textTransform: "uppercase",
  letterSpacing: letterSpacing.loosest,
});

// Lets the button grow inside a flex row (e.g. equal-share with sibling).
export const grow = style({ flex: 1 });
