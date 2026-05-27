import { style } from "@vanilla-extract/css";
import { vars, radii, fontSize } from "../../theme";

// Bordered, transparent, mono form input. Distinct from TextInput (the filled
// search-box style); color-scheme for date pickers is set on the theme class.
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
});

// Free-text "note"/"task" treatment.
export const serif = style({
  fontFamily: vars.font.display,
  fontStyle: "italic",
  fontSize: fontSize.xl,
});

// Solid fill for when the input sits on a tinted (editing) card.
export const filled = style({
  background: vars.background.surface,
});
