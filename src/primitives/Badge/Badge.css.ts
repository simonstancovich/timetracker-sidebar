import { style, styleVariants } from "@vanilla-extract/css";
import { vars, radii } from "../../theme";

export const root = style({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 12px 6px 9px",
  borderRadius: radii.pill,
  boxShadow: vars.shadow.engrave,
});

export const tone = styleVariants({
  pink: {
    background: vars.background.pink,
    border: `1px solid ${vars.background.pinkPaper}`,
    color: vars.typography.pink,
  },
  green: {
    background: vars.background.green,
    border: `1px solid ${vars.border.green}`,
    color: vars.typography.green,
  },
  accent: {
    background: `color-mix(in srgb, ${vars.typography.accent} 8%, transparent)`,
    border: `1px solid color-mix(in srgb, ${vars.typography.accent} 20%, transparent)`,
    color: vars.typography.accent,
  },
});
