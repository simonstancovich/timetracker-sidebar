import { style, styleVariants } from "@vanilla-extract/css";
import { chart, fontSize, fontWeight, vars } from "../theme";

export const card = style({
  background: vars.background.surface,
  border: `1px solid ${vars.border.soft}`,
  borderRadius: 12,
  padding: "10px 12px",
  gap: 10,
});

export const dot = style({
  width: 8,
  height: 8,
  borderRadius: "50%",
  flexShrink: 0,
});

export const dotColor = styleVariants({
  "0": { background: chart[0] },
  "1": { background: chart[1] },
  "2": { background: chart[2] },
  "3": { background: chart[3] },
});

export const title = style({
  fontSize: fontSize.md,
  fontWeight: fontWeight.bold,
  color: vars.typography.primary,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

export const subtitle = style({
  fontSize: fontSize.sm,
  color: vars.typography.tertiary,
  marginTop: 2,
});

export const playBtn = style({
  width: 34,
  height: 34,
});
