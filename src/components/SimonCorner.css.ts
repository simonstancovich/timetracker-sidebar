import { style } from "@vanilla-extract/css";
import { vars, zIndex } from "../theme";

export const corner = style({
  top: 0,
  left: 0,
  width: 22,
  height: 22,
  zIndex: zIndex.simonCorner,
});

export const dot = style({
  position: "absolute",
  top: 4,
  left: 4,
  width: 5,
  height: 5,
  borderRadius: "50%",
  background: vars.typography.green,
  opacity: 0.7,
});
