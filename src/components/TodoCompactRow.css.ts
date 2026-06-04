import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../theme";

export const card = style({
  border: `1px solid ${vars.border.soft}`,
  borderLeftWidth: 3,
  borderRadius: 9,
  padding: "8px 10px",
  background: vars.background.surface,
  boxShadow: "var(--shadow-engrave)",
});

export const cardLevelBorder = styleVariants({
  upcoming: { borderLeftColor: vars.typography.tertiary },
  today: { borderLeftColor: vars.typography.accent },
  soon: { borderLeftColor: vars.typography.soon },
  urgent: { borderLeftColor: vars.typography.urgent },
  overdue: { borderLeftColor: vars.typography.error },
});

export const cardActive = style({
  border: `1px solid ${vars.typography.accent}`,
  borderLeft: `3px solid ${vars.typography.accent}`,
  background: vars.background.accent,
});

export const header = style({
  selectors: {
    "&&": {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
    },
  },
});

export const main = style({
  selectors: { "&&": { flex: 1, minWidth: 0 } },
});

export const text = style({
  fontSize: 13,
  color: vars.typography.primary,
  lineHeight: 1.3,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

export const meta = style({
  fontFamily: vars.font.mono,
  fontSize: 8.5,
  color: vars.typography.faint,
  textTransform: "uppercase",
  letterSpacing: 1,
  marginTop: 2,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

export const badge = style({
  flexShrink: 0,
  fontFamily: vars.font.mono,
  fontSize: 8.5,
  fontWeight: 700,
  letterSpacing: 0.8,
  textTransform: "uppercase",
});

export const runningPill = style({
  flexShrink: 0,
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  padding: "5px 10px",
  borderRadius: 999,
  background: vars.typography.accent,
  color: vars.typography.onAccent,
  fontFamily: vars.font.mono,
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: 1,
  textTransform: "uppercase",
  vars: {
    "--live-pulse-ring": `color-mix(in srgb, ${vars.typography.accent} 40%, transparent)`,
  },
});

export const startBtn = style({
  flexShrink: 0,
  fontFamily: vars.font.mono,
  letterSpacing: 1,
  textTransform: "uppercase",
  cursor: "pointer",
  whiteSpace: "nowrap",
  selectors: {
    "&&": {
      padding: "6px 12px",
      borderRadius: 999,
      background: vars.background.button,
      color: vars.typography.onAccent,
      border: "none",
      fontSize: 9,
      fontWeight: 700,
      boxShadow: vars.shadow.button,
    },
  },
});

export const pressureWrap = style({ marginTop: 7 });

export const runningDot = style({
  width: 5,
  height: 5,
  borderRadius: "50%",
  background: vars.typography.onAccent,
});
