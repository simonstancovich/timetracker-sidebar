import { style } from "@vanilla-extract/css";
import { vars } from "../theme";

export const row = style({
  marginTop: -2,
  selectors: { "&&": { flexWrap: "wrap", gap: 5 } },
});

export const chip = style({
  display: "inline-flex",
  fontFamily: vars.font.display,
  fontStyle: "italic",
  cursor: "pointer",
  maxWidth: 220,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  lineHeight: 1.2,
  selectors: {
    "&&": {
      padding: "4px 10px",
      borderRadius: 999,
      background: "transparent",
      border: `1px solid ${vars.border.soft}`,
      color: vars.typography.tertiary,
      fontSize: 12,
    },
  },
});
