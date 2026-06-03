import { style, styleVariants } from "@vanilla-extract/css";
import { vars, zIndex } from "../theme";

export const root = style({
  inset: 0,
  background: vars.background.page,
  zIndex: zIndex.modeTransition,
  transition: "opacity 180ms ease-out",
});

export const state = styleVariants({
  hidden: { opacity: 0, pointerEvents: "none" },
  out: { opacity: 1, pointerEvents: "auto" },
});
