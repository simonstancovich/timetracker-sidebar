import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../theme";

const editorialText = style({
  fontFamily: vars.font.display,
  fontStyle: "italic",
  lineHeight: 1.3,
  textAlign: "center",
});

export const vibe = style([editorialText, {
  fontSize: 15,
  color: vars.typography.tertiary,
  padding: "0 8px",
}]);

export const vibeIcon = style({ marginLeft: 6 });

export const insight = style([editorialText, {
  fontSize: 13,
  color: vars.typography.faint,
  padding: "0 18px",
  lineHeight: 1.4,
}]);

export const idleCancelRow = style({
  paddingTop: 4,
  selectors: { "&&": { justifyContent: "center", gap: 14 } },
});

const circleBtn32 = style({
  width: 32,
  height: 32,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all .15s ease",
  selectors: { "&&": { padding: 0, borderRadius: "50%" } },
});

export const idleCancelBase = style([circleBtn32]);
export const idleCancelTone = styleVariants({
  idle: {
    selectors: {
      "&&": {
        background: "transparent",
        border: `1px solid ${vars.border.soft}`,
        color: vars.typography.faint,
      },
    },
  },
  armed: {
    selectors: {
      "&&": {
        background: `color-mix(in srgb, ${vars.typography.error} 10%, transparent)`,
        border: `1px solid ${vars.typography.error}`,
        color: vars.typography.error,
      },
    },
  },
});

export const absenceRow = style({
  marginTop: 4,
  selectors: { "&&": { justifyContent: "center" } },
});
