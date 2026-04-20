import { style, styleVariants } from "@vanilla-extract/css";
import {
  vars,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
} from "../../theme";

export const root = style({
  margin: 0,
  color: vars.typography.primary,
  fontFamily: vars.font.body,
  fontWeight: fontWeight.black,
  lineHeight: lineHeight.tight,
  letterSpacing: letterSpacing.tightest,
});

export const level = styleVariants({
  1: { fontSize: fontSize["4xl"] },
  2: { fontSize: fontSize["3xl"] },
  3: { fontSize: fontSize["2xl"] },
  4: { fontSize: fontSize.xl },
  5: { fontSize: fontSize.lg },
  6: { fontSize: fontSize.md },
});

export const color = styleVariants({
  primary: { color: vars.typography.primary },
  secondary: { color: vars.typography.secondary },
  accent: { color: vars.typography.accent },
  onAccent: { color: vars.typography.onAccent },
});
