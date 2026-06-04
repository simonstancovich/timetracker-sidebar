import { style } from "@vanilla-extract/css";
import { vars } from "../theme";

const editorialText = style({
  fontFamily: vars.font.display,
  fontStyle: "italic",
  lineHeight: 1.3,
  textAlign: "center",
});

export const formColumn = style({
  padding: "4px 0 0",
  selectors: { "&&": { gap: 10 } },
});

export const needFields = style([editorialText, {
  fontSize: 14,
  color: vars.typography.pink,
  padding: "4px 8px",
  lineHeight: 1.4,
}]);

const pillBtnBase = style({
  height: 44,
  letterSpacing: 1.4,
  textTransform: "uppercase",
  cursor: "pointer",
  selectors: {
    "&&": {
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 600,
      border: "none",
      padding: 0,
    },
  },
});

export const resumeBtn = style([pillBtnBase, {
  selectors: {
    "&&": {
      background: "transparent",
      border: `1px solid ${vars.border.soft}`,
      color: vars.typography.primary,
    },
  },
}]);

export const startBtn = style([pillBtnBase, {
  width: "100%",
  selectors: {
    "&&": {
      background: vars.background.button,
      border: "1px solid transparent",
      color: vars.typography.onAccent,
      boxShadow: vars.shadow.button,
    },
  },
}]);

export const stopLogBtn = style([pillBtnBase, {
  selectors: {
    "&&": {
      background: vars.background.button,
      border: "1px solid transparent",
      color: vars.typography.onAccent,
      boxShadow: vars.shadow.button,
    },
  },
}]);

export const ctxRow = style({
  margin: "20px 0 14px",
  selectors: { "&&": { alignItems: "center", gap: 12 } },
});

export const ctxLabel = style({
  fontSize: 10,
  color: vars.typography.secondary,
  fontWeight: 700,
  letterSpacing: 1.4,
  textTransform: "uppercase",
  whiteSpace: "nowrap",
});

const inlineInput = style({
  selectors: {
    "&&": {
      padding: "8px 6px",
      background: "transparent",
      border: "none",
      borderBottom: `1px solid ${vars.border.soft}`,
      borderRadius: 8,
      color: vars.typography.primary,
      outline: "none",
      width: "100%",
      fontFamily: "inherit",
    },
  },
});

export const inlineInputFocused = style({
  selectors: {
    "&&": {
      borderBottom: `1px solid ${vars.typography.accent}`,
    },
  },
});

export const inlineDesc = style([inlineInput, {
  selectors: { "&&": { fontSize: 14 } },
}]);

export const inlineNote = style([inlineInput, {
  selectors: { "&&": { fontSize: 13, resize: "none" } },
}]);

export const formDoneBtn = style({
  alignSelf: "center",
  marginTop: 8,
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  cursor: "pointer",
  fontFamily: vars.font.mono,
  letterSpacing: 1.4,
  textTransform: "uppercase",
  selectors: {
    "&&": {
      padding: "10px 22px",
      borderRadius: 999,
      background: vars.background.button,
      border: "none",
      color: vars.typography.onAccent,
      fontSize: 11,
      fontWeight: 700,
      boxShadow: vars.shadow.button,
    },
  },
});
