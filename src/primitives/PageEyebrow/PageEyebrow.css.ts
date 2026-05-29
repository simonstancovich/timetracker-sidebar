import { style } from "@vanilla-extract/css";
import { vars, spacing, fontSize, fontWeight, lineHeight } from "../../theme";

const PAD_X = 14;
const PAD_TOP = 12;
const PAD_BOTTOM = 10;

export const root = style({
  position: "relative",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  gap: spacing.md,
  padding: `${PAD_TOP}px ${PAD_X}px ${PAD_BOTTOM}px`,
  marginBottom: spacing.sm,
});

export const title = style({
  fontFamily: vars.font.display,
  fontStyle: "italic",
  fontSize: 16,
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
  left: PAD_X,
  right: PAD_X,
  bottom: 0,
  height: 1,
  background: vars.border.strong,
});
