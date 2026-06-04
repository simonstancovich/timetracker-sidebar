import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../theme";

export const button = style({
  width: 22,
  height: 22,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  selectors: {
    "&&": {
      borderRadius: "50%",
      border: "none",
      padding: 0,
      color: vars.typography.onAccent,
    },
  },
});

export const tone = styleVariants({
  resume: { selectors: { "&&": { background: vars.background.button } } },
  pause: { selectors: { "&&": { background: vars.typography.pink } } },
});
