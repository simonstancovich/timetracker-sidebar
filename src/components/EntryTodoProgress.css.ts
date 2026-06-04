import { style } from "@vanilla-extract/css";
import { vars } from "../theme";

export const row = style({
  marginTop: 6,
  selectors: { "&&": { gap: 7 } },
});

export const bar = style({
  maxWidth: 96,
});

export const text = style({
  fontFamily: vars.font.mono,
  fontSize: 9,
  fontVariantNumeric: "tabular-nums",
  whiteSpace: "nowrap",
  selectors: { "&&": { color: vars.typography.tertiary } },
});

export const textComplete = style({
  selectors: { "&&": { color: vars.typography.green } },
});
