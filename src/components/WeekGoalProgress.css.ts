import { style } from "@vanilla-extract/css";
import { vars } from "../theme";

export const wrap = style({
  selectors: { "&&": { gap: 8 } },
});

export const headerRow = style({
  selectors: {
    "&&": {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
    },
  },
});

export const headerLabel = style({
  fontFamily: vars.font.mono,
  fontSize: 9,
  fontWeight: 600,
  color: vars.typography.tertiary,
  letterSpacing: 2.2,
  textTransform: "uppercase",
});

export const headerValue = style({
  fontFamily: vars.font.mono,
  fontSize: 11,
  color: vars.typography.secondary,
  fontWeight: 600,
  fontVariantNumeric: "tabular-nums",
});

export const totalHit = style({ color: vars.typography.green });
export const totalProgress = style({ color: vars.typography.primary });
export const goalNumber = style({ color: vars.typography.faint });

export const footerRow = style({
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

export const deltaText = style({
  fontFamily: vars.font.display,
  fontStyle: "italic",
  fontSize: 13,
  color: vars.typography.tertiary,
  lineHeight: 1.3,
});

export const flex = style({
  fontFamily: vars.font.mono,
  fontSize: 10,
  color: vars.typography.faint,
  letterSpacing: 0.4,
  fontVariantNumeric: "tabular-nums",
});

export const flexLabel = style({
  textTransform: "uppercase",
  letterSpacing: 1.6,
  fontWeight: 600,
});

export const flexPositive = style({ color: vars.typography.green, fontWeight: 700 });
export const flexNegative = style({ color: vars.typography.soon, fontWeight: 700 });
