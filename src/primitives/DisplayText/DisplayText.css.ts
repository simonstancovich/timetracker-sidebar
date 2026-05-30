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
  fontFamily: vars.font.display,
  margin: 0,
});

export const leading = styleVariants(lineHeight, (v) => ({ lineHeight: v }));

export const size = styleVariants({
  md: { fontSize: fontSize.md },
  lg: { fontSize: fontSize.lg },
  xl: { fontSize: fontSize.xl },
  "2xl": { fontSize: fontSize["2xl"] },
  "3xl": { fontSize: fontSize["3xl"] },
  "4xl": { fontSize: fontSize["4xl"] },
  display: { fontSize: fontSize.display },
  "5xl": { fontSize: fontSize["5xl"] },
});

export const maxWidth = styleVariants(widths, (v) => ({ maxWidth: v }));

export const weight = styleVariants({
  normal: { fontWeight: fontWeight.normal },
  medium: { fontWeight: fontWeight.medium },
  semibold: { fontWeight: fontWeight.semibold },
  bold: { fontWeight: fontWeight.bold },
});

export const color = styleVariants(vars.typography, (v) => ({ color: v }));

export const align = styleVariants({
  left: { textAlign: "left" },
  center: { textAlign: "center" },
  right: { textAlign: "right" },
});

export const tracking = styleVariants(letterSpacing, (v) => ({
  letterSpacing: v,
}));

export const italic = style({ fontStyle: "italic" });

export const tabular = style({ fontVariantNumeric: "tabular-nums" });

export const truncate = style({
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  minWidth: 0,
});
