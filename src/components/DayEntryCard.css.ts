import { style, styleVariants } from "@vanilla-extract/css";
import { fontSize, fontWeight, spacing, vars } from "../theme";

export const card = style({
  background: vars.background.surface,
  borderRadius: 11,
  padding: "9px 11px",
  transition: "border-color .15s",
  cursor: "pointer",
});

export const cardBorder = styleVariants({
  normal: {
    border: `1px solid ${vars.border.soft}`,
  },
  pending: {
    border: `1px solid ${vars.typography.error}`,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottom: "none",
  },
});

export const projectLabel = style({
  fontSize: fontSize.xs,
  fontWeight: fontWeight.semibold,
  color: vars.typography.tertiary,
  marginBottom: 2,
});

export const description = style({
  fontSize: fontSize.base,
  color: vars.typography.primary,
  lineHeight: 1.4,
  wordBreak: "break-word",
});

export const internalNote = style({
  fontSize: fontSize.sm,
  color: vars.typography.tertiary,
  marginTop: spacing.xs,
  fontStyle: "italic",
});

export const hours = style({
  fontSize: fontSize.base,
  fontWeight: fontWeight.bold,
  color: vars.typography.accent,
});

export const editBtn = style({
  color: vars.typography.secondary,
});

export const deleteBtnState = styleVariants({
  normal: { color: vars.typography.tertiary },
  pending: {
    border: `1px solid ${vars.typography.error}`,
    background: `color-mix(in srgb, ${vars.typography.error} 10%, transparent)`,
    color: vars.typography.error,
  },
});

export const confirmCollapse = style({
  overflow: "hidden",
  transition: "max-height .22s ease",
});

export const confirmCollapseState = styleVariants({
  closed: { maxHeight: 0 },
  open: { maxHeight: 44 },
});

export const confirmStrip = style({
  borderRadius: "0 0 11px 11px",
  overflow: "hidden",
  border: `1px solid ${vars.typography.error}`,
  borderTop: "none",
});

export const confirmBtnReset = style({
  border: "none",
  borderRadius: 0,
  boxShadow: "none",
  padding: "10px 0",
  fontSize: fontSize.base,
});

export const confirmCancel = style({
  fontWeight: fontWeight.semibold,
});

export const confirmDelete = style({
  fontWeight: fontWeight.bold,
});
