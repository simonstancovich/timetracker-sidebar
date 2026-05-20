import { style } from "@vanilla-extract/css";
import { vars, spacing, radii, fontSize, fontWeight } from "../../theme";

export const root = style({
  display: "block",
  padding: spacing.md,
  background: vars.background.surface,
  color: vars.typography.tertiary,
  border: `1.5px solid ${vars.border.strong}`,
  borderRadius: radii.md,
  fontSize: fontSize.md,
  fontFamily: vars.font.body,
  fontWeight: fontWeight.normal,
  outline: "none",
  cursor: "text",
});

export const filled = style({
  color: vars.typography.primary,
  borderColor: vars.border.accent,
  fontWeight: fontWeight.medium,
});

// Extra right padding to leave room for an absolutely-positioned trailing
// element (e.g. a clear button).
export const trailingSpace = style({ paddingRight: spacing["2xl"] });

export const fullWidth = style({ width: "100%" });
