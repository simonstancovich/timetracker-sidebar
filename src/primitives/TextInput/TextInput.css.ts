import { style } from "@vanilla-extract/css";
import { vars, spacing, radii, fontSize, fontWeight } from "../../theme";

export const root = style({
  display: "block",
  padding: spacing.md,
  background: vars.background.surface,
  color: vars.typography.primary,
  border: `1.5px solid ${vars.border.strong}`,
  borderRadius: radii.md,
  fontSize: fontSize.md,
  fontFamily: vars.font.body,
  fontWeight: fontWeight.normal,
  outline: "none",
  cursor: "text",
  selectors: {
    "&::placeholder": {
      color: vars.typography.tertiary,
    },
    "&:focus-visible": {
      outline: `2px solid ${vars.border.accent}`,
      outlineOffset: 2,
    },
  },
});

export const filled = style({
  borderColor: vars.border.accent,
  fontWeight: fontWeight.medium,
});

export const invalid = style({
  borderColor: vars.typography.error,
  selectors: {
    "&:focus-visible": {
      outline: `2px solid ${vars.typography.error}`,
      outlineOffset: 2,
    },
  },
});

export const trailingSpace = style({ paddingRight: spacing["2xl"] });

export const fullWidth = style({ width: "100%" });
