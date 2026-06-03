import { keyframes, style } from "@vanilla-extract/css";
import { fontSize, fontWeight, vars } from "../../theme";

const floatUp = keyframes({
  "0%": { opacity: 1, transform: "translateY(0) scale(1)" },
  "70%": { opacity: 1, transform: "translateY(-52px) scale(1.06)" },
  "100%": { opacity: 0, transform: "translateY(-85px) scale(.9)" },
});

export const root = style({
  maxWidth: "100%",
  background: vars.background.surface,
  border: `1px solid ${vars.border.soft}`,
  borderRadius: 13,
  padding: "9px 18px",
  fontFamily: vars.font.mono,
  fontSize: fontSize.xl,
  fontWeight: fontWeight.black,
  textAlign: "center",
  lineHeight: 1.35,
  overflowWrap: "anywhere",
  animationName: floatUp,
  animationDuration: "1.5s",
  animationTimingFunction: "ease-out",
  animationFillMode: "forwards",
});
