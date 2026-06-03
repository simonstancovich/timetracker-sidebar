import { style, styleVariants } from "@vanilla-extract/css";
import { fontSize, fontWeight, vars } from "../theme";

export const root = style({
  padding: "15px 14px 24px",
  gap: 11,
});

export const backBtn = style({
  background: vars.background.raised,
  border: `1px solid ${vars.border.soft}`,
  color: vars.typography.secondary,
  borderRadius: 999,
  padding: "6px 12px",
  fontSize: fontSize.sm,
  fontWeight: fontWeight.semibold,
  boxShadow: "none",
  gap: 5,
});

export const heading = style({
  fontSize: fontSize.sm,
  fontWeight: fontWeight.bold,
  letterSpacing: 0.5,
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  flex: 1,
  textAlign: "right",
});

export const headingTone = styleVariants({
  editing: { color: vars.typography.accentInk },
  default: { color: vars.typography.secondary },
});

export const dateInput = style({
  padding: "11px 12px",
  border: `1px solid ${vars.border.soft}`,
  fontSize: fontSize.md,
  selectors: {
    "&:focus-visible": {
      outline: `2px solid ${vars.border.accent}`,
      outlineOffset: 2,
    },
  },
});

export const recentHint = style({
  fontSize: fontSize.sm,
  color: vars.typography.faint,
  marginBottom: 8,
});

export const dividerLabel = style({
  fontSize: fontSize.xs,
  color: vars.typography.tertiary,
  whiteSpace: "nowrap",
  textTransform: "uppercase",
  letterSpacing: 1,
});

export const hoursWrap = style({
  background: vars.background.surface,
  border: `1px solid ${vars.border.soft}`,
  borderRadius: 10,
  overflow: "hidden",
});

export const stepperBtn = style({
  width: 46,
  height: 46,
  background: "transparent",
  color: vars.typography.tertiary,
  fontSize: 20,
  fontWeight: 200,
  border: "none",
  borderRadius: 0,
  boxShadow: "none",
  padding: 0,
});

export const stepperBorderLeft = style({
  borderRight: `1px solid ${vars.border.soft}`,
});

export const stepperBorderRight = style({
  borderLeft: `1px solid ${vars.border.soft}`,
});

export const hoursInput = style({
  flex: 1,
  textAlign: "center",
  fontFamily: vars.font.mono,
  fontSize: 22,
  fontWeight: fontWeight.bold,
  color: vars.typography.primary,
  letterSpacing: -1,
  background: "transparent",
  border: "none",
  outline: "none",
  width: "100%",
  padding: 0,
});

export const hoursHint = style({
  textAlign: "center",
  marginTop: 4,
  fontSize: fontSize.sm,
  color: vars.typography.tertiary,
});

export const textareaField = style({
  padding: "11px 12px",
  border: `1px solid ${vars.border.soft}`,
});

export const notesOptional = style({
  color: vars.typography.faint,
  fontWeight: fontWeight.normal,
  letterSpacing: 0,
  textTransform: "none",
  fontSize: fontSize.xs,
});

export const toggleRow = style({
  gap: 10,
  padding: "10px 12px",
  background: vars.background.surface,
  border: `1px solid ${vars.border.soft}`,
  borderRadius: 10,
});

export const toggleSwitch = style({
  width: 40,
  height: 22,
  borderRadius: 11,
  padding: 2,
  cursor: "pointer",
  transition: "background .2s",
  border: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  boxShadow: "none",
});

export const toggleSwitchState = styleVariants({
  on: { background: vars.typography.accent },
  off: { background: vars.border.soft },
});

export const toggleKnob = style({
  width: 18,
  height: 18,
  borderRadius: 9,
  background: vars.typography.onAccent,
  transition: "transform .2s",
  boxShadow: "0 1px 4px rgba(0,0,0,.2)",
});

export const toggleKnobState = styleVariants({
  on: { transform: "translateX(18px)" },
  off: { transform: "translateX(0)" },
});

export const toggleLabel = style({
  fontSize: fontSize.md,
  color: vars.typography.primary,
});

export const saveBtn = style({
  width: "100%",
  height: 46,
  borderRadius: 12,
  fontSize: fontSize.lg,
  fontWeight: fontWeight.bold,
  padding: 0,
  selectors: {
    "&:disabled": {
      background: vars.background.glass,
      color: vars.typography.tertiary,
      cursor: "default",
      opacity: 1,
      boxShadow: "none",
    },
  },
});
