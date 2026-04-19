import { style, styleVariants } from "@vanilla-extract/css";
import { vars, fontSize, lineHeight, widths } from "../../theme";

export const root = style({
  margin: 0,
  fontFamily: vars.font.body,
  fontSize: fontSize.md,
  lineHeight: lineHeight.relaxed,
});

export const color = styleVariants(vars.typography, (v) => ({ color: v }));

export const align = styleVariants({
  left: { textAlign: "left" },
  center: { textAlign: "center" },
  right: { textAlign: "right" },
});

export const maxWidth = styleVariants(widths, (v) => ({ maxWidth: v }));
