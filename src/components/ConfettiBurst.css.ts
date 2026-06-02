import { style } from "@vanilla-extract/css";
import { zIndex } from "../theme";

export const anchor = style({
  left: "50%",
  top: "30%",
  width: 0,
  height: 0,
  pointerEvents: "none",
  zIndex: zIndex.confetti,
});
