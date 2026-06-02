import { keyframes, style } from "@vanilla-extract/css";

const burst = keyframes({
  "0%": { transform: "translate(0,0) rotate(0deg) scale(1)", opacity: 1 },
  "60%": { opacity: 1 },
  "100%": {
    transform: "translate(var(--cx,0), var(--cy,0)) rotate(var(--cr,180deg)) scale(0.6)",
    opacity: 0,
  },
});

export const root = style({
  position: "absolute",
  left: 0,
  top: 0,
  width: 6,
  height: 9,
  borderRadius: 1,
  transformOrigin: "center",
  animationName: burst,
  animationDuration: "1.8s",
  animationTimingFunction: "cubic-bezier(.22,1,.36,1)",
  animationFillMode: "forwards",
});
