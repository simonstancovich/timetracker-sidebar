import { style, styleVariants } from "@vanilla-extract/css";
import { fontSize, fontWeight, vars } from "../theme";

export const wrap = style({
  textAlign: "center",
});

export const wrapPadding = styleVariants({
  day: { padding: "6px 0 8px" },
  today: { padding: "20px 0 22px" },
});

export const numberBase = style({
  fontFamily: vars.font.display,
  fontWeight: fontWeight.normal,
  lineHeight: 0.9,
  fontVariantNumeric: "tabular-nums",
  display: "inline-block",
});

export const numberSize = styleVariants({
  day: { fontSize: 74, letterSpacing: -2.4 },
  today: { fontSize: 90, letterSpacing: -3 },
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
  marginLeft: 4,
});

export const suffixSize = styleVariants({
  day: { fontSize: 34 },
  today: { fontSize: 40 },
});

export const suffixColor = styleVariants({
  goal: { color: vars.typography.green },
  inProgress: { color: vars.typography.accent },
});

export const subtitleBase = style({
  fontFamily: vars.font.mono,
  color: vars.typography.tertiary,
  textTransform: "uppercase",
  fontWeight: fontWeight.medium,
});

export const subtitleSize = styleVariants({
  day: { fontSize: fontSize.xs, marginTop: 10, letterSpacing: 2.2 },
  today: { fontSize: fontSize.base, marginTop: 16, letterSpacing: 2.4 },
});
