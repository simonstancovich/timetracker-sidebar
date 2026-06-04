import { style } from "@vanilla-extract/css";

export const wrap = style({
  selectors: { "&&": { gap: 8 } },
});

export const row = style({
  selectors: { "&&": { gap: 8, flexWrap: "wrap" } },
});
