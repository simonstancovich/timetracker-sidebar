import { style, styleVariants } from "@vanilla-extract/css";

export const root = style({
  display: "inline-block",
  lineHeight: 0,
  imageRendering: "pixelated",
  shapeRendering: "crispEdges",
});

export const svg = style({
  display: "block",
  shapeRendering: "crispEdges",
});

export const sadOverlay = style({
  opacity: 0.55,
  filter: "saturate(0.4)",
});

export const sizeVariant = styleVariants({
  xs: { width: 14, height: 14 },
  sm: { width: 28, height: 28 },
  md: { width: 56, height: 56 },
  lg: { width: 112, height: 112 },
  xl: { width: 224, height: 224 },
});
