import { style, styleVariants } from "@vanilla-extract/css";
import { chart, fontSize, fontWeight, vars } from "../theme";

export const sectionLabel = style({
  fontFamily: vars.font.mono,
  fontSize: fontSize["2xs"],
  fontWeight: fontWeight.semibold,
  color: vars.typography.tertiary,
  letterSpacing: 2.2,
  textTransform: "uppercase",
  marginBottom: 10,
});

export const missingLabel = style({
  fontFamily: vars.font.mono,
  fontSize: fontSize["2xs"],
  fontWeight: fontWeight.semibold,
  color: vars.typography.soon,
  letterSpacing: 2.2,
  textTransform: "uppercase",
});

export const clientRow = style({
  padding: "8px 0 8px 12px",
});

export const clientStripe = style({
  position: "absolute",
  left: 0,
  top: 8,
  bottom: 8,
  width: 3,
  borderRadius: 2,
});

export const clientStripeColor = styleVariants({
  "0": { background: chart[0] },
  "1": { background: chart[1] },
  "2": { background: chart[2] },
  "3": { background: chart[3] },
});

export const clientName = style({
  fontFamily: vars.font.display,
  fontSize: 17,
  letterSpacing: -0.1,
  flex: 1,
  minWidth: 0,
});

export const clientNameColor = styleVariants({
  "0": { color: chart[0] },
  "1": { color: chart[1] },
  "2": { color: chart[2] },
  "3": { color: chart[3] },
});

export const clientHours = style({
  fontSize: fontSize.base,
  fontWeight: fontWeight.semibold,
  color: vars.typography.secondary,
});

export const missingPill = style({
  background: "transparent",
  border: `1px solid ${vars.border.soft}`,
  color: vars.typography.secondary,
  borderRadius: 999,
  padding: "5px 12px",
  fontFamily: vars.font.mono,
  fontSize: fontSize.xs,
  cursor: "pointer",
  fontWeight: fontWeight.semibold,
  letterSpacing: 1,
  textTransform: "uppercase",
  boxShadow: "none",
});

export const moreDaysHint = style({
  fontFamily: vars.font.mono,
  fontSize: fontSize.xs,
  color: vars.typography.faint,
  alignSelf: "center",
  letterSpacing: 1,
  textTransform: "uppercase",
  fontWeight: fontWeight.semibold,
});

export const insightQuote = style({
  fontFamily: vars.font.display,
  fontStyle: "italic",
  fontSize: fontSize.xl,
  color: vars.typography.accentInk,
  lineHeight: 1.4,
  letterSpacing: -0.1,
});

export const insightAttribution = style({
  fontFamily: vars.font.mono,
  fontSize: fontSize["3xs"],
  color: vars.typography.tertiary,
  textTransform: "uppercase",
  letterSpacing: 1.8,
  marginTop: 10,
  fontWeight: fontWeight.semibold,
});

export const closeBtn = style({
  padding: "8px 18px",
  borderRadius: 999,
  background: "transparent",
  border: `1px solid ${vars.border.soft}`,
  color: vars.typography.secondary,
  fontFamily: vars.font.mono,
  fontSize: fontSize.xs,
  fontWeight: fontWeight.semibold,
  letterSpacing: 1.4,
  textTransform: "uppercase",
  boxShadow: "none",
  selectors: {
    "&:disabled": {
      cursor: "default",
      opacity: 0.6,
    },
  },
});

export const refreshing = style({
  textAlign: "center",
  letterSpacing: 1.4,
});
