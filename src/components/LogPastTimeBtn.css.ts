import { style } from "@vanilla-extract/css";
import { vars } from "../theme";

export const wrap = style({
  paddingTop: 14,
  selectors: { "&&": { justifyContent: "center" } },
});

export const button = style({
  cursor: "pointer",
  fontFamily: vars.font.mono,
  letterSpacing: 1.4,
  textTransform: "uppercase",
  transition: "all .15s ease",
  selectors: {
    "&&": {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "9px 18px 9px 14px",
      borderRadius: 999,
      background: "transparent",
      border: `1px solid ${vars.border.soft}`,
      color: vars.typography.secondary,
      fontSize: 11,
      fontWeight: 600,
    },
  },
});
