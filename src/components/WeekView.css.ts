import { style } from "@vanilla-extract/css";
import { vars } from "../theme";

export const page = style({
  padding: "14px 14px 24px",
  selectors: { "&&": { gap: 18 } },
});

export const refreshHint = style({
  fontFamily: vars.font.mono,
  fontSize: 9,
  color: vars.typography.faint,
  textAlign: "center",
  letterSpacing: 1.4,
  textTransform: "uppercase",
});
