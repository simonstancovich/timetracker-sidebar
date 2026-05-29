import { style } from "@vanilla-extract/css";
import { vars, spacing, fontSize, fontWeight, lineHeight } from "../../theme";

export const root = style({
  position: "relative",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  gap: spacing.md,
  padding: "12px 14px 10px",
  marginBottom: spacing.sm,
});

export const title = style({
  fontFamily: vars.font.display,
  fontStyle: "italic",
  fontSize: 16, // off-scale: between xl (15) and 2xl (17)
  color: vars.typography.secondary,
  letterSpacing: -0.1,
  lineHeight: lineHeight.tight,
});

export const hint = style({
  fontFamily: vars.font.mono,
  fontSize: fontSize["2xs"],
  color: vars.typography.faint,
  textTransform: "uppercase",
  letterSpacing: 2,
  fontWeight: fontWeight.semibold,
});

export const divider = style({
  position: "absolute",
  left: 14,
  right: 14,
  bottom: 0,
  height: 1,
  background: vars.border.strong,
});
