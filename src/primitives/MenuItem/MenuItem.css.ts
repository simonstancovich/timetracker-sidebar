import { style } from "@vanilla-extract/css";
import { vars, spacing, fontSize } from "../../theme";

export const root = style({
  padding: `${spacing.sm}px ${spacing.md}px`,
  fontFamily: vars.font.body,
  fontSize: fontSize.md,
  color: vars.typography.primary,
  background: "transparent",
  cursor: "pointer",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

export const highlighted = style({
  color: vars.typography.accentInk,
  background: vars.background.accentMuted,
});
