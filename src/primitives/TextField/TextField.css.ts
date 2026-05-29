import { style } from "@vanilla-extract/css";
import { vars, radii, fontSize } from "../../theme";

export const root = style({
  width: "100%",
  padding: "8px 10px",
  background: "transparent",
  border: `1px solid ${vars.border.soft}`,
  borderRadius: radii.sm,
  color: vars.typography.primary,
  fontSize: fontSize.md,
  fontFamily: vars.font.mono,
  outline: "none",
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

export const serif = style({
  fontFamily: vars.font.display,
  fontStyle: "italic",
  fontSize: fontSize.xl,
});

export const filled = style({
  background: vars.background.surface,
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
