import { style } from "@vanilla-extract/css";

export const grid = style({
  selectors: { "&&": { gap: 6 } },
});
