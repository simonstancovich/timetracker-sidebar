import { style } from "@vanilla-extract/css";
import { radii, vars, zIndex } from "../../theme";

export const root = style({
  position: "fixed",
  background: vars.background.surface,
  border: `1px solid ${vars.border.soft}`,
  borderRadius: radii.xl,
  padding: "13px 15px 12px",
  boxShadow: "0 14px 40px rgba(0, 0, 0, 0.4)",
  zIndex: zIndex.introTooltip,
  color: vars.typography.primary,
});
