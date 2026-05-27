import { style } from "@vanilla-extract/css";

// FormCard is Card + a vertical field stack.
export const stack = style({
  display: "flex",
  flexDirection: "column",
  gap: 10, // off-scale: between sm (8) and md (12)
});
