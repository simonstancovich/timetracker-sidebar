import { globalStyle, keyframes, style, styleVariants } from "@vanilla-extract/css";
import { sizes, radii, vars } from "../../theme";

const SHIMMER_HIGHLIGHT = "rgba(255, 255, 255, 0.22)";
const SHIMMER_EDGE = "rgba(255, 255, 255, 0.08)";

const shimmer = keyframes({
  "0%": { backgroundPosition: "-150% 0" },
  "100%": { backgroundPosition: "250% 0" },
});

export const root = style({
  position: "relative",
  overflow: "hidden",
  backgroundColor: vars.background.skeleton,
});

globalStyle(`div.${root}`, { display: "block" });
globalStyle(`span.${root}`, { display: "inline-block", verticalAlign: "middle" });

globalStyle(`.${root}::after`, {
  content: '""',
  position: "absolute",
  inset: 0,
  backgroundImage: `linear-gradient(100deg, transparent 0%, ${SHIMMER_EDGE} 40%, ${SHIMMER_HIGHLIGHT} 50%, ${SHIMMER_EDGE} 60%, transparent 100%)`,
  backgroundSize: "200% 100%",
  backgroundRepeat: "no-repeat",
  animation: `${shimmer} 1.3s cubic-bezier(0.4, 0, 0.2, 1) infinite`,
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      animation: "none",
    },
  },
});

export const height = styleVariants(sizes, (v) => ({ height: v }));
export const width = styleVariants(sizes, (v) => ({ width: v }));
export const radius = styleVariants(radii, (v) => ({ borderRadius: v }));
