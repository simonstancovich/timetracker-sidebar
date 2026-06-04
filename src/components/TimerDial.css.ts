import { style, styleVariants } from "@vanilla-extract/css";
import { fontSize, fontWeight, vars } from "../theme";

export const dialZone = style({
  position: "relative",
});

export const dialContent = style({
  transition: "opacity 220ms cubic-bezier(.22,1,.36,1)",
  selectors: {
    [`${dialZone}:hover &`]: { opacity: 0.18 },
    [`${dialZone}:focus-within &`]: { opacity: 0.18 },
  },
});

export const dialControls = style({
  position: "absolute",
  inset: 0,
  opacity: 0,
  pointerEvents: "none",
  transition: "opacity 220ms cubic-bezier(.22,1,.36,1)",
  selectors: {
    "&&": { gap: 14 },
    [`${dialZone}:hover &`]: { opacity: 1, pointerEvents: "auto" },
    [`${dialZone}:focus-within &`]: { opacity: 1, pointerEvents: "auto" },
  },
});

export const dialZonePad = style({ padding: "12px 0 6px" });

export const dialCenter = style({
  textAlign: "center",
  padding: "0 8px",
});

export const dialClockBase = style({
  fontFamily: vars.font.display,
  fontSize: 38,
  fontWeight: 400,
  letterSpacing: -1.5,
  lineHeight: 0.95,
  fontVariantNumeric: "tabular-nums",
});

export const dialClockColor = styleVariants({
  running: { color: vars.typography.primary },
  paused: { color: vars.typography.tertiary },
});

export const dialStatusBase = style({
  fontFamily: vars.font.mono,
  fontSize: fontSize["3xs"],
  fontWeight: fontWeight.bold,
  letterSpacing: 2,
  textTransform: "uppercase",
  marginTop: 8,
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
});

export const dialStatusColor = styleVariants({
  running: { color: vars.typography.pink },
  idle: { color: vars.typography.faint },
});

export const dialBtnBase = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 52,
  height: 52,
  cursor: "pointer",
  transition: "transform 140ms cubic-bezier(.22,1,.36,1), background 160ms ease",
  selectors: {
    "&&": { borderRadius: "50%", border: "none", padding: 0 },
    "&:hover": { transform: "scale(1.06)" },
    "&:active": { transform: "scale(0.94)", transitionDuration: "80ms" },
  },
});

export const dialBtnTone = styleVariants({
  pause: {
    selectors: {
      "&&": {
        background: vars.background.surface,
        border: `1px solid ${vars.border.soft}`,
        color: vars.typography.primary,
      },
    },
  },
  stop: {
    selectors: {
      "&&": {
        background: vars.background.button,
        color: vars.typography.onAccent,
        boxShadow: vars.shadow.button,
      },
    },
  },
});
