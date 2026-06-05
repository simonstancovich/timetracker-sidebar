import { style } from "@vanilla-extract/css";
import { vars } from "../theme";

export const quote = style({
  fontFamily: vars.font.display,
  fontStyle: "italic",
  fontSize: 15,
  color: vars.typography.accentInk,
  lineHeight: 1.4,
  letterSpacing: -0.1,
});

export const attribution = style({
  fontFamily: vars.font.mono,
  fontSize: 8,
  color: vars.typography.tertiary,
  textTransform: "uppercase",
  letterSpacing: 1.8,
  marginTop: 10,
  fontWeight: 600,
});
