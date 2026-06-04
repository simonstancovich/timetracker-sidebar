import { style } from "@vanilla-extract/css";
import { vars } from "../theme";

export const block = style({ textAlign: "center", padding: "4px 14px" });

export const client = style({
  fontFamily: vars.font.display,
  fontSize: 24,
  color: vars.typography.primary,
  letterSpacing: -0.3,
  lineHeight: 1.1,
});

export const project = style({
  fontFamily: vars.font.mono,
  fontSize: 10,
  color: vars.typography.faint,
  textTransform: "uppercase",
  letterSpacing: 1.8,
  fontWeight: 600,
  marginTop: 6,
});

export const desc = style({
  fontFamily: vars.font.display,
  fontStyle: "italic",
  fontSize: 15,
  color: vars.typography.tertiary,
  marginTop: 14,
  padding: "0 6px",
  lineHeight: 1.45,
});

export const actionsRow = style({
  marginTop: 14,
  selectors: { "&&": { justifyContent: "center", gap: 8 } },
});

export const sideQuestBtn = style({
  fontFamily: vars.font.mono,
  letterSpacing: 1.6,
  textTransform: "uppercase",
  cursor: "pointer",
  transition: "all .15s ease",
  selectors: {
    "&&": {
      padding: "6px 14px",
      borderRadius: 999,
      background: "transparent",
      border: `1px solid color-mix(in srgb, ${vars.typography.accent} 33%, transparent)`,
      color: vars.typography.accent,
      fontSize: 9,
      fontWeight: 700,
    },
  },
});
