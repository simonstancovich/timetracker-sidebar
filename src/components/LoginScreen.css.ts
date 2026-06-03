import { style } from "@vanilla-extract/css";
import { fontSize, vars } from "../theme";

export const form = style({
  width: "100%",
  maxWidth: 300,
  gap: 10,
});

export const signInBtn = style({
  width: "100%",
  padding: "11px 0",
  fontSize: fontSize.lg,
  selectors: {
    "&:disabled": {
      background: vars.background.raised,
      color: vars.typography.faint,
      cursor: "not-allowed",
      opacity: 1,
      boxShadow: "none",
    },
  },
});

export const fallbackBtn = style({
  color: vars.typography.tertiary,
  fontSize: fontSize.base,
  textDecoration: "underline",
  marginTop: 2,
});
