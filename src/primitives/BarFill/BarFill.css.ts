import { style, styleVariants } from "@vanilla-extract/css";
import { vars, radii } from "../../theme";

export const root = style({
  width: "100%",
  minHeight: 6,
  borderRadius: radii.xs,
});

export const tone = styleVariants({
  met: { background: vars.typography.green },
  today: { background: vars.typography.accent },
  partial: { background: vars.typography.soon },
});

export const active = style({
  outline: `1.5px solid ${vars.typography.accent}`,
  outlineOffset: 1,
});
