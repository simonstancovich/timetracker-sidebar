import { keyframes, style, styleVariants } from "@vanilla-extract/css";

const introFadeUp = keyframes({
  from: { opacity: 0, transform: "translateY(8px)" },
  to: { opacity: 1, transform: "translateY(0)" },
});

export const fadeUp = style({
  animationName: introFadeUp,
  animationDuration: "600ms",
  animationTimingFunction: "ease-out",
  animationFillMode: "both",
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      animation: "none",
    },
  },
});

export const delay = styleVariants({
  "1": { animationDelay: "80ms" },
  "2": { animationDelay: "120ms" },
  "3": { animationDelay: "200ms" },
  "4": { animationDelay: "300ms" },
  "5": { animationDelay: "380ms" },
});
