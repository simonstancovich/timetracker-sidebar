import { style } from "@vanilla-extract/css";
import { vars } from "../theme";

export const box = style({
  flexShrink: 0,
  width: 20,
  height: 20,
  marginTop: 1,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  selectors: {
    "&&": {
      borderRadius: 6,
      border: `1.5px solid ${vars.border.soft}`,
      background: "transparent",
      color: vars.typography.onAccent,
      fontSize: 11,
      padding: 0,
    },
  },
});

export const boxDone = style({
  selectors: {
    "&&": {
      border: `1.5px solid ${vars.typography.green}`,
      background: vars.typography.green,
    },
  },
});
