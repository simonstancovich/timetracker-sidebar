import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../theme";

export const controls = style({
  marginTop: "auto",
  paddingBottom: 16,
  selectors: { "&&": { justifyContent: "center", gap: 18 } },
});

const circleBtn40 = style({
  width: 40,
  height: 40,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all .15s ease",
  selectors: { "&&": { borderRadius: "50%", padding: 0 } },
});

export const pauseBtn = style([circleBtn40, {
  selectors: {
    "&&": {
      background: "transparent",
      border: `1px solid ${vars.border.soft}`,
      color: vars.typography.primary,
    },
  },
}]);

export const stopBtn = style([circleBtn40, {
  selectors: {
    "&&": {
      background: vars.background.button,
      border: "none",
      color: vars.typography.onAccent,
      boxShadow: vars.shadow.button,
    },
  },
}]);

export const cancelBtnBase = style([circleBtn40]);
export const cancelBtnTone = styleVariants({
  idle: {
    selectors: {
      "&&": {
        background: "transparent",
        border: `1px solid ${vars.border.soft}`,
        color: vars.typography.tertiary,
      },
    },
  },
  armed: {
    selectors: {
      "&&": {
        background: `color-mix(in srgb, ${vars.typography.error} 12%, transparent)`,
        border: `1px solid ${vars.typography.error}`,
        color: vars.typography.error,
      },
    },
  },
});

export const confirmRow = style({
  padding: "0 0 12px",
  selectors: { "&&": { gap: 8, justifyContent: "center" } },
});
