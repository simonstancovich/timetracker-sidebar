import { style } from "@vanilla-extract/css";
import { vars } from "../theme";

export const card = style({
  border: `1px solid ${vars.border.soft}`,
  borderRadius: 12,
  padding: "11px 13px",
  background: vars.background.surface,
  boxShadow: "var(--shadow-engrave)",
  transition: "border-color 200ms ease-out, background 200ms ease-out",
});

export const cardActive = style({
  border: `1px solid ${vars.typography.accent}`,
  background: vars.background.accent,
  boxShadow: `0 0 0 1px color-mix(in srgb, ${vars.typography.accent} 33%, transparent)`,
});

export const cardDone = style({
  opacity: 0.55,
});

export const header = style({
  selectors: {
    "&&": {
      display: "flex",
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },
  },
});

export const main = style({
  selectors: { "&&": { flex: 1, minWidth: 0 } },
});

export const text = style({
  fontSize: 14,
  color: vars.typography.primary,
  lineHeight: 1.35,
  overflowWrap: "anywhere",
  wordBreak: "break-word",
});

export const textDone = style({
  textDecoration: "line-through",
});

export const meta = style({
  fontFamily: vars.font.mono,
  fontSize: 9,
  color: vars.typography.faint,
  textTransform: "uppercase",
  letterSpacing: 1.2,
  marginTop: 4,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

export const planned = style({
  fontFamily: vars.font.mono,
  fontSize: 9,
  color: vars.typography.tertiary,
  letterSpacing: 0.6,
  marginTop: 4,
});

export const runningPill = style({
  flexShrink: 0,
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "3px 7px",
  borderRadius: 999,
  background: vars.typography.accent,
  color: vars.typography.onAccent,
  fontFamily: vars.font.mono,
  fontSize: 8,
  fontWeight: 700,
  letterSpacing: 1.2,
  textTransform: "uppercase",
});

export const dueBadge = style({
  flexShrink: 0,
  fontFamily: vars.font.mono,
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: 1,
  textTransform: "uppercase",
});

export const progressRow = style({
  marginTop: 10,
  selectors: {
    "&&": {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
    },
  },
});

export const progressLabel = style({
  fontFamily: vars.font.mono,
  fontSize: 9.5,
  fontVariantNumeric: "tabular-nums",
  color: vars.typography.tertiary,
  whiteSpace: "nowrap",
});

export const progressLabelComplete = style({
  color: vars.typography.green,
});

export const deleteBtn = style({
  flexShrink: 0,
  width: 24,
  height: 24,
  cursor: "pointer",
  selectors: {
    "&&": {
      borderRadius: "50%",
      background: "transparent",
      border: "none",
      color: vars.typography.faint,
      fontSize: 13,
      padding: 0,
    },
  },
});
