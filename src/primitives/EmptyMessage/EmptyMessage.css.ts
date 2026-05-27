import { style } from "@vanilla-extract/css";
import { vars, fontSize, lineHeight } from "../../theme";

// Centered italic-serif copy for empty / nothing-here states.
export const root = style({
  fontFamily: vars.font.display,
  fontStyle: "italic",
  fontSize: fontSize.lg,
  color: vars.typography.tertiary,
  textAlign: "center",
  padding: "16px 8px",
  lineHeight: lineHeight.loose,
});
