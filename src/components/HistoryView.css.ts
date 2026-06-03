import { style, styleVariants } from "@vanilla-extract/css";
import { fontSize, fontWeight, vars } from "../theme";

export const scaleTab = style({
  padding: "6px 12px",
  border: "none",
  borderRadius: 999,
  fontFamily: vars.font.mono,
  fontSize: fontSize.xs,
  fontWeight: fontWeight.bold,
  letterSpacing: 1.4,
  textTransform: "uppercase",
  cursor: "pointer",
  transition: "all 150ms ease",
});

export const scaleTabState = styleVariants({
  selected: {
    background: vars.typography.accent,
    color: vars.typography.onAccent,
  },
  unselected: {
    background: "transparent",
    color: vars.typography.tertiary,
  },
});

export const navBtn = style({
  width: 26,
  height: 26,
  borderRadius: "50%",
  background: "transparent",
  border: `1px solid ${vars.border.soft}`,
  color: vars.typography.secondary,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
  transition: "all 140ms ease",
});

export const nowPill = style({
  background: vars.typography.accent,
  border: "none",
  color: vars.typography.onAccent,
  fontFamily: vars.font.mono,
  fontSize: fontSize["2xs"],
  fontWeight: fontWeight.bold,
  cursor: "pointer",
  padding: "0 10px",
  height: 22,
  marginLeft: 4,
  borderRadius: 999,
  letterSpacing: 1.2,
  textTransform: "uppercase",
});
