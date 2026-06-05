import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../theme";

export const card = style({
  transition: "all 160ms cubic-bezier(.22,1,.36,1)",
  textAlign: "center",
  boxShadow: "var(--shadow-engrave)",
  selectors: {
    "&&": {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      borderRadius: 10,
      padding: "12px 4px",
      border: `1px solid ${vars.border.soft}`,
      background: vars.background.surface,
    },
  },
});

export const cardToday = style({
  selectors: {
    "&&&": {
      background: `color-mix(in srgb, ${vars.typography.accent} 10%, transparent)`,
      border: `1.5px solid ${vars.typography.accent}`,
    },
  },
});

export const cardDisabled = style({
  cursor: "default",
});

export const weekday = style({
  fontFamily: vars.font.mono,
  fontSize: 8,
  fontWeight: 700,
  letterSpacing: 1.6,
  color: vars.typography.tertiary,
  lineHeight: 1,
});

export const weekdayToday = style({
  color: vars.typography.accent,
});

export const dayNum = style({
  fontFamily: vars.font.display,
  fontSize: 24,
  color: vars.typography.primary,
  lineHeight: 1,
  fontVariantNumeric: "tabular-nums",
  letterSpacing: -0.4,
});

export const dayNumToday = style({
  color: vars.typography.accent,
});

export const hours = style({
  fontFamily: vars.font.mono,
  fontSize: 9,
  fontWeight: 600,
  lineHeight: 1,
  fontVariantNumeric: "tabular-nums",
  letterSpacing: 0.2,
});

export const hoursColor = styleVariants({
  today: { color: vars.typography.accent },
  future: { color: vars.typography.faint },
  hit: { color: vars.typography.green },
  partial: { color: vars.typography.soon },
  missed: { color: vars.typography.error },
  muted: { color: vars.typography.faint },
});
