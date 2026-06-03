import { style } from "@vanilla-extract/css";
import { vars } from "../theme";

export const strip = style({
  padding: "7px 10px",
  background: `color-mix(in srgb, ${vars.typography.error} 10%, transparent)`,
  border: `1px solid color-mix(in srgb, ${vars.typography.error} 25%, transparent)`,
});

export const label = style({
  flex: 1,
});
