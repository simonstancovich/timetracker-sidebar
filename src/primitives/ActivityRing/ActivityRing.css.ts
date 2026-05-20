import { style } from "@vanilla-extract/css";
import { vars, duration, easing } from "../../theme";

export const root = style({
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
});

export const svg = style({
  position: "absolute",
  inset: 0,
});

export const track = style({
  stroke: vars.border.soft,
});

const ringTransition = `stroke-dashoffset ${duration.medium}ms cubic-bezier(.34,1.08,.64,1), stroke 240ms ${easing.inOut}`;
const ringRotate = {
  transform: "rotate(-90deg)",
  transformOrigin: "center",
} as const;

export const ring = style({
  stroke: vars.typography.accent,
  transition: ringTransition,
  ...ringRotate,
});

export const ringDone = style({
  stroke: vars.typography.green,
  transition: ringTransition,
  ...ringRotate,
});

export const tick = style({
  stroke: vars.border.soft,
  strokeWidth: 0.7,
  strokeLinecap: "round",
  opacity: 0.6,
});

export const tickMajor = style({
  stroke: vars.border.strong,
  strokeWidth: 0.9,
  strokeLinecap: "round",
  opacity: 0.7,
});

export const content = style({
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  lineHeight: 1,
});
