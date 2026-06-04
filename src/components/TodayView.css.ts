import { style } from "@vanilla-extract/css";

export const page = style({ paddingBottom: 24 });

export const content = style({
  padding: "12px 14px 0",
  selectors: { "&&": { gap: 11 } },
});
