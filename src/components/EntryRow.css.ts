import { style } from "@vanilla-extract/css";
import { vars } from "../theme";

export const wrap = style({});

export const card = style({
  background: vars.background.surface,
  border: `1px solid ${vars.border.soft}`,
  borderRadius: 11,
  padding: "9px 11px",
  cursor: "pointer",
  boxShadow: "var(--shadow-engrave)",
  transition: "transform 160ms cubic-bezier(.22,1,.36,1), background 160ms ease, border-color 160ms ease",
  selectors: {
    "&:hover": { transform: "translateY(-1px)" },
    "&:active": { transform: "scale(0.985)", transitionDuration: "90ms" },
  },
});

export const cardPendingDelete = style({
  border: `1px solid ${vars.typography.error}`,
  borderBottom: "none",
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
});

export const cardBody = style({
  selectors: {
    "&&": {
      display: "flex",
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 8,
    },
  },
});

export const cardMain = style({
  flex: 1,
  minWidth: 0,
});

export const project = style({
  fontSize: 10,
  fontWeight: 600,
  color: vars.typography.tertiary,
  marginBottom: 2,
});

export const description = style({
  fontSize: 12,
  color: vars.typography.primary,
  lineHeight: 1.4,
  wordBreak: "break-word",
});

export const internalNote = style({
  fontSize: 11,
  color: vars.typography.tertiary,
  marginTop: 4,
  fontStyle: "italic",
});

export const actions = style({
  paddingTop: 1,
  selectors: {
    "&&": {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      flexShrink: 0,
    },
  },
});

export const hours = style({
  fontFamily: vars.font.mono,
  fontSize: 12,
  fontWeight: 700,
  color: vars.typography.accent,
});

export const deleteBtn = style({
  cursor: "pointer",
  selectors: {
    "&&": {
      background: "none",
      border: "none",
      color: vars.typography.tertiary,
      fontSize: 12,
      padding: "2px 4px",
      fontWeight: 400,
      borderRadius: 0,
    },
  },
});

export const deleteBtnArmed = style({
  selectors: {
    "&&": {
      color: vars.typography.error,
      fontWeight: 700,
    },
  },
});

export const confirmDrawer = style({
  overflow: "hidden",
  transition: "max-height .22s ease",
  maxHeight: 0,
});

export const confirmDrawerOpen = style({
  maxHeight: 44,
});

export const confirmRow = style({
  borderRadius: "0 0 11px 11px",
  overflow: "hidden",
  border: `1px solid ${vars.typography.error}`,
  borderTop: "none",
  selectors: {
    "&&": { display: "flex", flexDirection: "row" },
  },
});

const confirmBtn = style({
  flex: 1,
  padding: "10px 0",
  fontSize: 12,
  cursor: "pointer",
  selectors: { "&&": { border: "none", borderRadius: 0 } },
});

export const confirmCancel = style([confirmBtn, {
  selectors: {
    "&&": {
      background: vars.background.raised,
      color: vars.typography.secondary,
      fontWeight: 600,
    },
  },
}]);

export const confirmDelete = style([confirmBtn, {
  selectors: {
    "&&": {
      background: vars.typography.error,
      color: vars.typography.onAccent,
      fontWeight: 700,
    },
  },
}]);
