import { style } from "@vanilla-extract/css";
import { vars } from "../theme";

export const wrap = style({
  selectors: { "&&": { gap: 8 } },
});

export const eyebrow = style({
  fontFamily: vars.font.mono,
  fontSize: 9,
  fontWeight: 600,
  color: vars.typography.warning,
  letterSpacing: 2.2,
  textTransform: "uppercase",
});

export const row = style({
  selectors: { "&&": { display: "flex", flexDirection: "row", gap: 6, flexWrap: "wrap" } },
});

export const chip = style({
  fontFamily: vars.font.mono,
  letterSpacing: 1,
  textTransform: "uppercase",
  cursor: "pointer",
  selectors: {
    "&&": {
      background: "transparent",
      border: `1px solid ${vars.border.soft}`,
      color: vars.typography.secondary,
      borderRadius: 999,
      padding: "5px 12px",
      fontSize: 10,
      fontWeight: 600,
    },
  },
});
