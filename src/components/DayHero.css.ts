import { style, styleVariants } from "@vanilla-extract/css";
import { fontSize, fontWeight, vars } from "../theme";

export const wrap = style({
  textAlign: "center",
  padding: "6px 0 8px",
});

export const numberBase = style({
  fontFamily: vars.font.display,
  fontSize: 74,
  fontWeight: fontWeight.normal,
  letterSpacing: -2.4,
  lineHeight: 0.9,
  fontVariantNumeric: "tabular-nums",
  display: "inline-block",
});

export const numberColor = styleVariants({
  goal: { color: vars.typography.green },
  inProgress: { color: vars.typography.primary },
});

export const colonAnchor = style({
  display: "inline-flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: "0.13em",
  height: "0.65em",
  verticalAlign: "0.18em",
  margin: "0 0.12em",
});

export const dot = style({
  width: "0.085em",
  height: "0.085em",
  borderRadius: "50%",
  background: "currentColor",
});

export const suffixBase = style({
  fontStyle: "italic",
  fontSize: 34,
  marginLeft: 4,
});

export const suffixColor = styleVariants({
  goal: { color: vars.typography.green },
  inProgress: { color: vars.typography.accent },
});

export const subtitle = style({
  marginTop: 10,
  fontFamily: vars.font.mono,
  fontSize: fontSize.xs,
  color: vars.typography.tertiary,
  textTransform: "uppercase",
  letterSpacing: 2.2,
  fontWeight: fontWeight.medium,
});
