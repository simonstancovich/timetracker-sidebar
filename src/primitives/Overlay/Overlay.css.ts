import { globalStyle, style, styleVariants } from "@vanilla-extract/css";
import { spacing, vars, zIndex as z } from "../../theme";

export const layer = style({});

globalStyle(`.mode-root > *:not(.${layer})`, {
  position: "relative",
  zIndex: 1,
});

export const root = style({
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
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
  none: {},
  screen: {
    background: `linear-gradient(180deg, ${vars.background.page} 0%, ${vars.background.raised} 100%)`,
  },
  scrim: { background: vars.background.scrim },
});
