import { style } from "@vanilla-extract/css";

// Dark-mode ambient gradient. Applied to the app shell (AppLayout) and to the
// welcome/done IntroOverlay so the editorial screens share the same backdrop
// as the rest of the app in dark mode.
export const darkGlow = style({
  background: `
    radial-gradient(ellipse 700px 520px at 100% -4%, rgba(140, 104, 255, 0.24) 0%, transparent 56%),
    radial-gradient(ellipse 620px 900px at 0% 108%, rgba(196, 120, 214, 0.15) 0%, transparent 52%),
    linear-gradient(180deg, #120c1c 0%, #0b0910 44%, #08060e 100%)
  `,
});
