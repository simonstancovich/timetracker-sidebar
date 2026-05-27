import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../../theme";

export const track = style({
  width: "100%",
  background: vars.border.soft,
  overflow: "hidden",
});

// Flex-fill a row instead of taking full width.
export const grow = style({ flex: 1 });

// Each size bundles the track height/radius with the matching fill motion.
export const trackSize = styleVariants({
  thin: { height: 2 },
  mid: { height: 3, borderRadius: 2 },
  thick: { height: 4, borderRadius: 2 },
});

export const fill = style({ height: "100%" });

export const fillMotion = styleVariants({
  thin: { transition: "width 500ms cubic-bezier(.22,1,.36,1)" },
  mid: { transition: "width 400ms cubic-bezier(.22,1,.36,1)" },
  thick: { transition: "width 400ms cubic-bezier(.22,1,.36,1)" },
});

export const tone = styleVariants({
  accent: { background: vars.typography.accent },
  green: { background: vars.typography.green },
  gradient: {
    background: `linear-gradient(90deg, ${vars.typography.accent}, ${vars.typography.pink})`,
  },
  danger: { background: vars.typography.error },
  urgent: { background: "#ea580c" },
  soon: { background: "#d97706" },
  muted: { background: vars.typography.tertiary },
});
