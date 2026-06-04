import { style } from "@vanilla-extract/css";
import { vars } from "../theme";

export const button = style({
  cursor: "pointer",
  selectors: {
    "&&": {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      padding: "8px 2px",
      background: "transparent",
      border: "none",
      textAlign: "left",
      font: "inherit",
      color: "inherit",
      borderRadius: 0,
    },
  },
});

export const label = style({
  fontSize: 12,
  color: vars.typography.secondary,
  textTransform: "uppercase",
  letterSpacing: 1.4,
  fontWeight: 600,
});

export const trackBase = style({
  width: 28,
  height: 16,
  borderRadius: 999,
  padding: 2,
  transition: "background .2s",
});

export const trackOn = style({ background: vars.typography.accent });
export const trackOff = style({ background: vars.border.soft });

export const thumbBase = style({
  width: 12,
  height: 12,
  borderRadius: "50%",
  background: vars.typography.onAccent,
  transition: "transform .2s",
});

export const thumbOn = style({ transform: "translateX(12px)" });
export const thumbOff = style({ transform: "translateX(0)" });
