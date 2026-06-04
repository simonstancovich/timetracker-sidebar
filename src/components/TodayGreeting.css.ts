import { style } from "@vanilla-extract/css";
import { vars } from "../theme";

export const wrap = style({ padding: "16px 14px 4px" });

export const heading = style({
  fontFamily: vars.font.display,
  fontStyle: "italic",
  fontSize: 22,
  color: vars.typography.primary,
  letterSpacing: -0.3,
  lineHeight: 1.15,
});

export const subtitle = style({
  fontFamily: vars.font.display,
  fontStyle: "italic",
  fontSize: 14,
  color: vars.typography.accent,
  marginTop: 6,
  lineHeight: 1.4,
  letterSpacing: -0.1,
});
