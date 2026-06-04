import { style } from "@vanilla-extract/css";
import { vars } from "../theme";

export const wrap = style({
  selectors: { "&&": { gap: 7 } },
});

export const header = style({
  selectors: {
    "&&": {
      display: "flex",
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "space-between",
    },
  },
});

export const title = style({
  fontFamily: vars.font.display,
  fontSize: 17,
  color: vars.typography.primary,
});

export const count = style({
  fontFamily: vars.font.mono,
  fontSize: 10,
  fontWeight: 700,
  fontVariantNumeric: "tabular-nums",
  selectors: { "&&": { color: vars.typography.tertiary } },
});
