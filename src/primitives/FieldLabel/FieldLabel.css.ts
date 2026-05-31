import { style, styleVariants } from "@vanilla-extract/css";
import { vars, spacing, fontSize, fontWeight, letterSpacing } from "../../theme";

export const root = style({
  display: "block",
  fontFamily: vars.font.mono,
  fontSize: fontSize["3xs"],
  fontWeight: fontWeight.bold,
  letterSpacing: letterSpacing.loosest,
  textTransform: "uppercase",
  marginBottom: spacing.xs,
});

export const tone = styleVariants({
  faint: { color: vars.typography.faint },
  accent: { color: vars.typography.accent },
});
