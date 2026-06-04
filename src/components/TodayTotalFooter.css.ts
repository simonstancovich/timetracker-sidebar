import { style } from "@vanilla-extract/css";
import { vars } from "../theme";

export const wrap = style({
  paddingTop: 8,
  borderTop: `1px solid ${vars.background.raised}`,
  selectors: { "&&": { justifyContent: "flex-end", alignItems: "center", gap: 8 } },
});

export const label = style({
  fontSize: 12,
  color: vars.typography.tertiary,
});

export const valueBase = style({
  fontSize: 17,
  fontWeight: 700,
  fontFamily: vars.font.mono,
});

export const valueAccent = style({ color: vars.typography.accent });
export const valueDone = style({ color: vars.typography.green });
