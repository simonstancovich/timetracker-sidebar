import { style } from "@vanilla-extract/css";
import { vars, zIndex } from "../theme";

export const backdrop = style({
  background: "rgba(0,0,0,0.35)",
});

export const dialog = style({
  position: "absolute",
  bottom: 12,
  left: 12,
  right: 12,
  background: vars.background.surface,
  border: `1.5px solid ${vars.typography.accent}`,
  borderRadius: 14,
  padding: "14px 16px",
  zIndex: zIndex.modal,
  boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
});
