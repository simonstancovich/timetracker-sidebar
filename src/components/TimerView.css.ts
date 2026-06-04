import { style, styleVariants } from "@vanilla-extract/css";
import { fontSize, fontWeight, vars } from "../theme";

export const dialZone = style({
  position: "relative",
});

export const dialContent = style({
  transition: "opacity 220ms cubic-bezier(.22,1,.36,1)",
  selectors: {
    [`${dialZone}:hover &`]: { opacity: 0.18 },
    [`${dialZone}:focus-within &`]: { opacity: 0.18 },
  },
});

export const dialControls = style({
  position: "absolute",
  inset: 0,
  opacity: 0,
  pointerEvents: "none",
  transition: "opacity 220ms cubic-bezier(.22,1,.36,1)",
  selectors: {
    "&&": { gap: 14 },
    [`${dialZone}:hover &`]: { opacity: 1, pointerEvents: "auto" },
    [`${dialZone}:focus-within &`]: { opacity: 1, pointerEvents: "auto" },
  },
});

export const dialZonePad = style({ padding: "12px 0 6px" });

export const dialCenter = style({
  textAlign: "center",
  padding: "0 8px",
});

export const dialClockBase = style({
  fontFamily: vars.font.display,
  fontSize: 38,
  fontWeight: 400,
  letterSpacing: -1.5,
  lineHeight: 0.95,
  fontVariantNumeric: "tabular-nums",
});

export const dialClockColor = styleVariants({
  running: { color: vars.typography.primary },
  paused: { color: vars.typography.tertiary },
});

export const dialStatusBase = style({
  fontFamily: vars.font.mono,
  fontSize: fontSize["3xs"],
  fontWeight: fontWeight.bold,
  letterSpacing: 2,
  textTransform: "uppercase",
  marginTop: 8,
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
});

export const dialStatusColor = styleVariants({
  running: { color: vars.typography.pink },
  idle: { color: vars.typography.faint },
});

export const dialBtnBase = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 52,
  height: 52,
  cursor: "pointer",
  transition: "transform 140ms cubic-bezier(.22,1,.36,1), background 160ms ease",
  selectors: {
    "&&": { borderRadius: "50%", border: "none", padding: 0 },
    "&:hover": { transform: "scale(1.06)" },
    "&:active": { transform: "scale(0.94)", transitionDuration: "80ms" },
  },
});

export const dialBtnTone = styleVariants({
  pause: {
    selectors: {
      "&&": {
        background: vars.background.surface,
        border: `1px solid ${vars.border.soft}`,
        color: vars.typography.primary,
      },
    },
  },
  stop: {
    selectors: {
      "&&": {
        background: vars.background.button,
        color: vars.typography.onAccent,
        boxShadow: vars.shadow.button,
      },
    },
  },
});

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

export const inlineInput = style({
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

export const recentDescChips = style({
  marginTop: -2,
  selectors: { "&&": { flexWrap: "wrap", gap: 5 } },
});

export const recentDescChip = style({
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

export const invoiceableToggleBtn = style({
  cursor: "pointer",
  selectors: {
    "&&": {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      padding: "8px 2px",
      background: "transparent",
      border: "none",
      textAlign: "left",
      font: "inherit",
      color: "inherit",
      borderRadius: 0,
    },
  },
});

export const invoiceableLabel = style({
  fontSize: 12,
  color: vars.typography.secondary,
  textTransform: "uppercase",
  letterSpacing: 1.4,
  fontWeight: 600,
});

export const switchTrackBase = style({
  width: 28,
  height: 16,
  borderRadius: 999,
  padding: 2,
  transition: "background .2s",
});

export const switchTrackOn = style({ background: vars.typography.accent });
export const switchTrackOff = style({ background: vars.border.soft });

export const switchThumbBase = style({
  width: 12,
  height: 12,
  borderRadius: "50%",
  background: vars.typography.onAccent,
  transition: "transform .2s",
});

export const switchThumbOn = style({ transform: "translateX(12px)" });
export const switchThumbOff = style({ transform: "translateX(0)" });

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

export const ctxBlock = style({ textAlign: "center", padding: "4px 14px" });

export const ctxClient = style({
  fontFamily: vars.font.display,
  fontSize: 24,
  color: vars.typography.primary,
  letterSpacing: -0.3,
  lineHeight: 1.1,
});

export const ctxProject = style({
  fontFamily: vars.font.mono,
  fontSize: 10,
  color: vars.typography.faint,
  textTransform: "uppercase",
  letterSpacing: 1.8,
  fontWeight: 600,
  marginTop: 6,
});

export const ctxDesc = style({
  fontFamily: vars.font.display,
  fontStyle: "italic",
  fontSize: 15,
  color: vars.typography.tertiary,
  marginTop: 14,
  padding: "0 6px",
  lineHeight: 1.45,
});

export const ctxActionsRow = style({
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

export const runningControls = style({
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

export const ctrlPause = style([circleBtn40, {
  selectors: {
    "&&": {
      background: "transparent",
      border: `1px solid ${vars.border.soft}`,
      color: vars.typography.primary,
    },
  },
}]);

export const ctrlStop = style([circleBtn40, {
  selectors: {
    "&&": {
      background: vars.background.button,
      border: "none",
      color: vars.typography.onAccent,
      boxShadow: vars.shadow.button,
    },
  },
}]);

export const ctrlCancelBase = style([circleBtn40]);
export const ctrlCancelTone = styleVariants({
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

export const cancelConfirmRow = style({
  padding: "0 0 12px",
  selectors: { "&&": { gap: 8, justifyContent: "center" } },
});

export const statsGrid = style({
  paddingTop: 18,
  borderTop: `1px solid ${vars.border.soft}`,
  textAlign: "center",
});

export const statBig = style({
  fontFamily: vars.font.display,
  fontSize: 24,
  lineHeight: 1,
  letterSpacing: -0.4,
});

export const statBigPrimary = style({ color: vars.typography.primary });
export const statBigGreen = style({ color: vars.typography.green });
export const statBigPink = style({ color: vars.typography.pink });

export const statStreakUnit = style({ fontSize: 16, opacity: 0.7 });

export const statLabel = style({
  fontFamily: vars.font.mono,
  fontSize: 8,
  color: vars.typography.faint,
  textTransform: "uppercase",
  letterSpacing: 1.6,
  fontWeight: 600,
  marginTop: 3,
});

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
