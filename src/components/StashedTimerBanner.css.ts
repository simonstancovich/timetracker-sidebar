import { style } from "@vanilla-extract/css";
import { fontSize, fontWeight, vars } from "../theme";

export const banner = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  padding: "9px 12px",
  borderRadius: 12,
  background: vars.background.accent,
  border: `1px solid ${vars.border.soft}`,
  cursor: "pointer",
  textAlign: "left",
  width: "100%",
  boxShadow: "none",
});

export const label = style({
  fontFamily: vars.font.mono,
  fontSize: fontSize["3xs"],
  fontWeight: fontWeight.bold,
  color: vars.typography.faint,
  textTransform: "uppercase",
  letterSpacing: 1.6,
  flexShrink: 0,
});

export const name = style({
  fontFamily: vars.font.display,
  fontStyle: "italic",
  fontSize: fontSize["2xl"],
  color: vars.typography.accentInk,
  letterSpacing: -0.1,
});

export const time = style({
  fontSize: fontSize.sm,
  fontWeight: fontWeight.bold,
  color: vars.typography.secondary,
});

export const returnHint = style({
  fontFamily: vars.font.mono,
  fontSize: fontSize["3xs"],
  fontWeight: fontWeight.bold,
  color: vars.typography.accent,
  textTransform: "uppercase",
  letterSpacing: 1.4,
});
