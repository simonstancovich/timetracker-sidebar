import { style } from "@vanilla-extract/css";

export const dialZone = style({
  position: "relative",
  display: "flex",
  justifyContent: "center",
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
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 14,
  opacity: 0,
  pointerEvents: "none",
  transition: "opacity 220ms cubic-bezier(.22,1,.36,1)",
  selectors: {
    [`${dialZone}:hover &`]: { opacity: 1, pointerEvents: "auto" },
    [`${dialZone}:focus-within &`]: { opacity: 1, pointerEvents: "auto" },
  },
});

export const dialBtn = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 52,
  height: 52,
  borderRadius: "50%",
  border: "none",
  cursor: "pointer",
  transition: "transform 140ms cubic-bezier(.22,1,.36,1), background 160ms ease",
  selectors: {
    "&:hover": { transform: "scale(1.06)" },
    "&:active": { transform: "scale(0.94)", transitionDuration: "80ms" },
  },
});
