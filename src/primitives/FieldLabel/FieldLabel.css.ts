import { style, styleVariants } from "@vanilla-extract/css";
import { vars, spacing, fontWeight } from "../../theme";

export const root = style({
  display: "block",
  fontFamily: vars.font.mono,
  fontSize: 8, // off-scale: the smallest micro-caption, below the 2xs (9) token
  fontWeight: fontWeight.bold,
  letterSpacing: 1.6,
  textTransform: "uppercase",
  marginBottom: spacing.xs,
});

export const tone = styleVariants({
  faint: { color: vars.typography.faint },
  accent: { color: vars.typography.accent },
});
