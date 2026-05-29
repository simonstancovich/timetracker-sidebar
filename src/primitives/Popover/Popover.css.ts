import { style } from "@vanilla-extract/css";
import { vars, spacing, radii, shadows, zIndex } from "../../theme";

export const root = style({
  position: "absolute",
  top: `calc(100% + ${spacing.xs}px)`,
  left: 0,
  right: 0,
  background: vars.background.page,
  backgroundImage: `linear-gradient(${vars.background.surface}, ${vars.background.surface})`,
  backdropFilter: "blur(20px) saturate(140%)",
  WebkitBackdropFilter: "blur(20px) saturate(140%)",
  border: `1px solid ${vars.border.strong}`,
  borderRadius: radii.md,
  boxShadow: shadows.card,
  maxHeight: 220,
  overflowY: "auto",
  zIndex: zIndex.dropdown,
});
