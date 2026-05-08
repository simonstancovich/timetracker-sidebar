import { style, styleVariants } from "@vanilla-extract/css";
import { vars, fontSize, fontWeight, lineHeight, widths } from "../../theme";

export const root = style({
  margin: 0,
  fontFamily: vars.font.body,
  lineHeight: lineHeight.relaxed,
});

export const size = styleVariants({
  xs: { fontSize: fontSize.xs },
  sm: { fontSize: fontSize.sm },
  base: { fontSize: fontSize.base },
  md: { fontSize: fontSize.md },
  lg: { fontSize: fontSize.lg },
});

export const weight = styleVariants({
  normal: { fontWeight: fontWeight.normal },
  medium: { fontWeight: fontWeight.medium },
  semibold: { fontWeight: fontWeight.semibold },
  bold: { fontWeight: fontWeight.bold },
  black: { fontWeight: fontWeight.black },
});

export const color = styleVariants(vars.typography, (v) => ({ color: v }));

export const align = styleVariants({
  left: { textAlign: "left" },
  center: { textAlign: "center" },
  right: { textAlign: "right" },
});

export const maxWidth = styleVariants(widths, (v) => ({ maxWidth: v }));

// Single-line ellipsis. `minWidth: 0` is the un-obvious requirement that lets
// a flex child actually shrink and trigger the ellipsis.
export const truncate = style({
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  minWidth: 0,
});
