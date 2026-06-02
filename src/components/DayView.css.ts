import { style, styleVariants } from "@vanilla-extract/css";
import { fontSize, fontWeight, vars } from "../theme";

const chartColor = [vars.chart["0"], vars.chart["1"], vars.chart["2"], vars.chart["3"]];

export const root = style({
  display: "flex",
  flexDirection: "column",
  gap: 14,
});

export const dateLabel = style({
  fontFamily: vars.font.display,
  fontStyle: "italic",
  fontSize: 22,
  color: vars.typography.primary,
  letterSpacing: -0.3,
  lineHeight: 1.15,
  textAlign: "center",
  paddingTop: 4,
});

export const loadingWrap = style({
  display: "flex",
  flexDirection: "column",
  gap: 8,
  padding: "4px 0",
});

export const skeletonTitle = style({ height: 18, width: "40%", borderRadius: 6 });
export const skeletonRow = style({ height: 52, borderRadius: 11 });

export const empty = style({
  textAlign: "center",
  padding: "28px 12px",
});

export const emptyTitle = style({
  fontSize: fontSize.md,
  fontWeight: fontWeight.semibold,
  color: vars.typography.secondary,
  marginBottom: 4,
  lineHeight: 1.5,
});

export const emptyHint = style({
  fontSize: fontSize.sm,
  color: vars.typography.faint,
  lineHeight: 1.5,
});

export const groupHeader = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  marginBottom: 8,
  paddingLeft: 12,
  position: "relative",
});

export const groupBar = style({
  position: "absolute",
  left: 0,
  top: 4,
  bottom: 4,
  width: 3,
  borderRadius: 2,
});

export const groupBarColor = styleVariants({
  "0": { background: chartColor[0] },
  "1": { background: chartColor[1] },
  "2": { background: chartColor[2] },
  "3": { background: chartColor[3] },
});

export const groupName = style({
  fontFamily: vars.font.display,
  fontSize: 17,
  letterSpacing: -0.1,
  lineHeight: 1.1,
});

export const groupNameColor = styleVariants({
  "0": { color: chartColor[0] },
  "1": { color: chartColor[1] },
  "2": { color: chartColor[2] },
  "3": { color: chartColor[3] },
});

export const groupHours = style({
  fontSize: fontSize.sm,
  fontWeight: fontWeight.semibold,
  color: vars.typography.secondary,
  fontVariantNumeric: "tabular-nums",
});

export const totalRow = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  paddingTop: 12,
  borderTop: `1px solid ${vars.border.soft}`,
});

export const totalLabel = style({
  fontFamily: vars.font.mono,
  fontSize: 9,
  color: vars.typography.faint,
  textTransform: "uppercase",
  letterSpacing: 2.2,
  fontWeight: fontWeight.semibold,
});

export const totalNumberBase = style({
  fontFamily: vars.font.display,
  fontSize: 22,
  lineHeight: 1,
  letterSpacing: -0.4,
  fontVariantNumeric: "tabular-nums",
});

export const totalNumberColor = styleVariants({
  goal: { color: vars.typography.green },
  inProgress: { color: vars.typography.primary },
});

export const logPastBtn = style({
  alignSelf: "center",
  marginTop: 4,
  gap: 8,
  padding: "9px 18px 9px 14px",
  borderRadius: 999,
  background: "transparent",
  border: `1px solid ${vars.border.soft}`,
  color: vars.typography.secondary,
  fontFamily: vars.font.mono,
  fontSize: fontSize.sm,
  fontWeight: fontWeight.semibold,
  letterSpacing: 1.4,
  textTransform: "uppercase",
});
