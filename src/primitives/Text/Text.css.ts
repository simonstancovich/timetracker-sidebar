import { style, styleVariants } from "@vanilla-extract/css";
import {
  vars,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  widths,
} from "../../theme";

export const root = style({
  margin: 0,
  fontFamily: vars.font.body,
  lineHeight: lineHeight.relaxed,
});

export const size = styleVariants({
  "2xs": { fontSize: fontSize["2xs"] },
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

export const transform = styleVariants({
  uppercase: { textTransform: "uppercase" },
  lowercase: { textTransform: "lowercase" },
  capitalize: { textTransform: "capitalize" },
});

export const tracking = styleVariants(letterSpacing, (v) => ({
  letterSpacing: v,
}));

export const italic = style({ fontStyle: "italic" });

// Single-line ellipsis. `minWidth: 0` is the un-obvious requirement that lets
// a flex child actually shrink and trigger the ellipsis.
export const truncate = style({
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  minWidth: 0,
});
