import { style } from "@vanilla-extract/css";
import { vars } from "../theme";

export const grid = style({
  paddingTop: 18,
  borderTop: `1px solid ${vars.border.soft}`,
  textAlign: "center",
});

export const big = style({
  fontFamily: vars.font.display,
  fontSize: 24,
  lineHeight: 1,
  letterSpacing: -0.4,
});

export const bigPrimary = style({ color: vars.typography.primary });
export const bigGreen = style({ color: vars.typography.green });
export const bigPink = style({ color: vars.typography.pink });

export const streakUnit = style({ fontSize: 16, opacity: 0.7 });

export const label = style({
  fontFamily: vars.font.mono,
  fontSize: 8,
  color: vars.typography.faint,
  textTransform: "uppercase",
  letterSpacing: 1.6,
  fontWeight: 600,
  marginTop: 3,
});
