import { style } from "@vanilla-extract/css";
import { vars } from "../theme";

export const grid = style({
  paddingTop: 14,
  paddingBottom: 12,
  borderTop: `1px solid ${vars.border.soft}`,
  borderBottom: `1px solid ${vars.border.soft}`,
  textAlign: "center",
  selectors: { "&&": { gap: 8 } },
});

export const value = style({
  fontFamily: vars.font.display,
  fontSize: 24,
  color: vars.typography.primary,
  lineHeight: 1,
  fontVariantNumeric: "tabular-nums",
  letterSpacing: -0.4,
});

export const valueSuffixAccent = style({
  fontStyle: "italic",
  fontSize: 15,
  color: vars.typography.accent,
  marginLeft: 1,
});

export const valueSuffixGreen = style({
  fontStyle: "italic",
  fontSize: 15,
  color: vars.typography.green,
  marginLeft: 1,
});

export const label = style({
  fontFamily: vars.font.mono,
  fontSize: 8,
  color: vars.typography.faint,
  textTransform: "uppercase",
  letterSpacing: 1.6,
  marginTop: 5,
  fontWeight: 600,
});
