import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../theme";

export const wrap = style({
  selectors: { "&&": { gap: 0 } },
});

export const eyebrow = style({
  fontFamily: vars.font.mono,
  fontSize: 9,
  fontWeight: 600,
  color: vars.typography.tertiary,
  letterSpacing: 2.2,
  textTransform: "uppercase",
  marginBottom: 10,
});

export const row = style({
  position: "relative",
  padding: "8px 0 8px 12px",
  selectors: {
    "&&": {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
      gap: 12,
    },
  },
});

export const stripe = style({
  position: "absolute",
  left: 0,
  top: 8,
  bottom: 8,
  width: 3,
  borderRadius: 2,
});

export const stripeChart = styleVariants({
  0: { background: vars.chart["0"] },
  1: { background: vars.chart["1"] },
  2: { background: vars.chart["2"] },
  3: { background: vars.chart["3"] },
});

export const name = style({
  fontFamily: vars.font.display,
  fontSize: 17,
  letterSpacing: -0.1,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  minWidth: 0,
  flex: 1,
});

export const hours = style({
  fontFamily: vars.font.mono,
  fontSize: 12,
  color: vars.typography.secondary,
  fontWeight: 600,
  fontVariantNumeric: "tabular-nums",
});

export const skeletonStack = style({
  selectors: { "&&": { gap: 6 } },
});

export const skeletonLabel = style({
  selectors: { "&&": { height: 12, width: 80 } },
});

export const skeletonRow = style({
  selectors: { "&&": { height: 28 } },
});
