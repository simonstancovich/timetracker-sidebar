import { style } from "@vanilla-extract/css";
import { vars } from "../theme";

export const banner = style({
  padding: "7px 14px",
  background: `color-mix(in srgb, ${vars.typography.error} 10%, transparent)`,
  borderTop: `1px solid color-mix(in srgb, ${vars.typography.error} 25%, transparent)`,
  borderBottom: `1px solid color-mix(in srgb, ${vars.typography.error} 25%, transparent)`,
});

export const label = style({
  flex: 1,
});
