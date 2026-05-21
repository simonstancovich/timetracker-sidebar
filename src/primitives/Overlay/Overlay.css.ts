import { style, styleVariants } from "@vanilla-extract/css";
import { spacing, vars, zIndex as z } from "../../theme";

export const root = style({
  position: "absolute",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  paddingTop: spacing["2xl"],
  paddingBottom: spacing["2xl"],
  paddingLeft: spacing.xl,
  paddingRight: spacing.xl,
  overflow: "auto",
});

export const zIndex = styleVariants(z, (v) => ({ zIndex: v }));

export const tone = styleVariants({
  // No backdrop — caller supplies one via className (e.g. the dark glow).
  none: {},
  // Theme page gradient; resolves per active theme.
  screen: {
    background: `linear-gradient(180deg, ${vars.background.page} 0%, ${vars.background.raised} 100%)`,
  },
  // Dark dimming backdrop behind a modal / spotlight.
  scrim: { background: "rgba(0, 0, 0, 0.6)" },
});
