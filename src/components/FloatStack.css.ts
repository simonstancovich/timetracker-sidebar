import { style } from "@vanilla-extract/css";
import { zIndex } from "../theme";

export const layer = style({
  inset: 0,
  pointerEvents: "none",
  overflow: "hidden",
  zIndex: zIndex.pinnedFloat,
});
