import { style } from "@vanilla-extract/css";
import { vars, fontSize, lineHeight, spacing } from "../../theme";

export const root = style({
  fontFamily: vars.font.display,
  fontStyle: "italic",
  fontSize: fontSize.lg,
  color: vars.typography.tertiary,
  textAlign: "center",
  padding: `${spacing.lg}px ${spacing.sm}px`,
  lineHeight: lineHeight.loose,
});
