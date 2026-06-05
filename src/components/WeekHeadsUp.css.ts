import { style } from "@vanilla-extract/css";
import { vars } from "../theme";

export const wrap = style({
  selectors: { "&&": { gap: 5 } },
});

export const eyebrow = style({
  fontFamily: vars.font.mono,
  fontSize: 9,
  fontWeight: 600,
  color: vars.typography.soon,
  letterSpacing: 2.2,
  textTransform: "uppercase",
});

export const list = style({
  fontFamily: vars.font.display,
  fontStyle: "italic",
  fontSize: 13,
  color: vars.typography.secondary,
  lineHeight: 1.5,
});
