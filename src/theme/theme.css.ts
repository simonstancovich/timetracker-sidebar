import { createThemeContract, createTheme, globalStyle } from "@vanilla-extract/css";
import { colors, pickColor, chartColors } from "./colors";
import { fontFamily, fontSize, fontWeight, lineHeight } from "./typography";
import { spacing } from "./spacing";
import { radii } from "./radii";
import { shadows } from "./shadows";

// ─── Contract ──────────────────────────────────────────────────────────────

export const vars = createThemeContract({
  typography: {
    primary: null,
    secondary: null,
    tertiary: null,
    faint: null,
    accent: null,
    accentStrong: null,
    accentInk: null,
    pink: null,
    pinkVivid: null,
    green: null,
    onAccent: null,
    error: null,
    warning: null,
    urgent: null,
    soon: null,
    danger: null,
    goalInk: null,
    partialInk: null,
    missedInk: null,
    warningInk: null,
  },
  background: {
    page: null,
    surface: null,
    raised: null,
    glass: null,
    accent: null,
    accentMuted: null,
    pink: null,
    pinkPaper: null,
    green: null,
    warning: null,
    urgent: null,
    danger: null,
    skeleton: null,
    scrim: null,
    saveScrim: null,
    button: null,
  },
  border: {
    soft: null,
    strong: null,
    green: null,
    pink: null,
    accent: null,
    warning: null,
  },
  chart: {
    "0": null,
    "1": null,
    "2": null,
    "3": null,
  },
  shadow: {
    brand: null,
    heavy: null,
    button: null,
    engrave: null,
  },
  font: {
    body: null,
    display: null,
    mono: null,
  },
});

// ─── Concrete theme instances ──────────────────────────────────────────────

const chartL = chartColors("light");
const chartD = chartColors("dark");

export const lightTheme = createTheme(vars, {
  typography: {
    primary: pickColor("typography", "primary", "light"),
    secondary: pickColor("typography", "secondary", "light"),
    tertiary: pickColor("typography", "tertiary", "light"),
    faint: pickColor("typography", "faint", "light"),
    accent: pickColor("typography", "accent", "light"),
    accentStrong: pickColor("typography", "accentStrong", "light"),
    accentInk: pickColor("typography", "accentInk", "light"),
    pink: pickColor("typography", "pink", "light"),
    pinkVivid: pickColor("typography", "pinkVivid", "light"),
    green: pickColor("typography", "green", "light"),
    onAccent: pickColor("typography", "onAccent", "light"),
    error: pickColor("typography", "error", "light"),
    warning: pickColor("typography", "warning", "light"),
    urgent: pickColor("typography", "urgent", "light"),
    soon: pickColor("typography", "soon", "light"),
    danger: pickColor("typography", "danger", "light"),
    goalInk: colors.typography.forestInk,
    partialInk: colors.typography.amberInk,
    missedInk: colors.typography.redInk,
    warningInk: colors.typography.warningInkLight,
  },
  background: {
    page: pickColor("background", "page", "light"),
    surface: pickColor("background", "surface", "light"),
    raised: pickColor("background", "raised", "light"),
    glass: pickColor("background", "glass", "light"),
    accent: pickColor("background", "accent", "light"),
    accentMuted: pickColor("background", "accentMuted", "light"),
    pink: pickColor("background", "pink", "light"),
    pinkPaper: pickColor("background", "pinkPaper", "light"),
    green: pickColor("background", "green", "light"),
    warning: pickColor("background", "warning", "light"),
    urgent: pickColor("background", "urgent", "light"),
    danger: pickColor("background", "danger", "light"),
    skeleton: pickColor("background", "skeleton", "light"),
    scrim: pickColor("background", "scrim", "light"),
    saveScrim: pickColor("background", "saveScrim", "light"),
    button: colors.brand.violet400,
  },
  border: {
    soft: pickColor("border", "soft", "light"),
    strong: pickColor("border", "strong", "light"),
    green: pickColor("border", "green", "light"),
    pink: pickColor("border", "pink", "light"),
    accent: pickColor("border", "accent", "light"),
    warning: pickColor("border", "warning", "light"),
  },
  chart: { "0": chartL[0], "1": chartL[1], "2": chartL[2], "3": chartL[3] },
  shadow: {
    brand: shadows.brand,
    heavy: shadows.heavy,
    button: shadows.brand,
    engrave: "inset 0 1px 0 rgba(255,255,255,0.55), 0 1px 0 rgba(0,0,0,0.025)",
  },
  font: {
    body: fontFamily.body,
    display: fontFamily.display,
    mono: fontFamily.mono,
  },
});

export const darkTheme = createTheme(vars, {
  typography: {
    primary: pickColor("typography", "primary", "dark"),
    secondary: pickColor("typography", "secondary", "dark"),
    tertiary: pickColor("typography", "tertiary", "dark"),
    faint: pickColor("typography", "faint", "dark"),
    accent: pickColor("typography", "accent", "dark"),
    accentStrong: pickColor("typography", "accentStrong", "dark"),
    accentInk: pickColor("typography", "accentInk", "dark"),
    pink: pickColor("typography", "pink", "dark"),
    pinkVivid: pickColor("typography", "pinkVivid", "dark"),
    green: pickColor("typography", "green", "dark"),
    onAccent: pickColor("typography", "onAccent", "dark"),
    error: pickColor("typography", "error", "dark"),
    warning: pickColor("typography", "warning", "dark"),
    urgent: pickColor("typography", "urgent", "dark"),
    soon: pickColor("typography", "soon", "dark"),
    danger: pickColor("typography", "danger", "dark"),
    goalInk: colors.typography.gray100,
    partialInk: colors.typography.amberInk,
    missedInk: colors.typography.redInk,
    warningInk: colors.typography.warningInkDark,
  },
  background: {
    page: pickColor("background", "page", "dark"),
    surface: pickColor("background", "surface", "dark"),
    raised: pickColor("background", "raised", "dark"),
    glass: pickColor("background", "glass", "dark"),
    accent: pickColor("background", "accent", "dark"),
    accentMuted: pickColor("background", "accentMuted", "dark"),
    pink: pickColor("background", "pink", "dark"),
    pinkPaper: pickColor("background", "pinkPaper", "dark"),
    green: pickColor("background", "green", "dark"),
    warning: pickColor("background", "warning", "dark"),
    urgent: pickColor("background", "urgent", "dark"),
    danger: pickColor("background", "danger", "dark"),
    skeleton: pickColor("background", "skeleton", "dark"),
    scrim: pickColor("background", "scrim", "dark"),
    saveScrim: pickColor("background", "saveScrim", "dark"),
    button: colors.brand.violet300,
  },
  border: {
    soft: pickColor("border", "soft", "dark"),
    strong: pickColor("border", "strong", "dark"),
    green: pickColor("border", "green", "dark"),
    pink: pickColor("border", "pink", "dark"),
    accent: pickColor("border", "accent", "dark"),
    warning: pickColor("border", "warning", "dark"),
  },
  chart: { "0": chartD[0], "1": chartD[1], "2": chartD[2], "3": chartD[3] },
  shadow: {
    brand: shadows.brand,
    heavy: shadows.heavy,
    button: shadows.heavy,
    engrave: "inset 0 1px 0 rgba(255,255,255,0.06), 0 1px 0 rgba(0,0,0,0.42)",
  },
  font: {
    body: fontFamily.body,
    display: fontFamily.display,
    mono: fontFamily.mono,
  },
});

// Chart palette as an indexable array (the per-mode values resolve via the
// theme class), for call sites that cycle colours by index.
export const chart = [
  vars.chart["0"],
  vars.chart["1"],
  vars.chart["2"],
  vars.chart["3"],
] as const;

export { fontSize, fontWeight, lineHeight, spacing, radii, shadows };

globalStyle(`.${lightTheme}`, {
  colorScheme: "light",
  vars: {
    "--shadow-engrave":
      "inset 0 1px 0 rgba(255,255,255,0.55), 0 1px 0 rgba(0,0,0,0.025)",
    "--grain-opacity": "0.05",
  },
});

globalStyle(`.${darkTheme}`, {
  colorScheme: "dark",
  vars: {
    "--shadow-engrave":
      "inset 0 1px 0 rgba(255,255,255,0.06), 0 1px 0 rgba(0,0,0,0.42)",
    "--grain-opacity": "0.08",
  },
});

globalStyle(
  "button:focus-visible, [role='switch']:focus-visible, [role='tab']:focus-visible",
  {
    outline: `2px solid ${vars.border.accent}`,
    outlineOffset: 2,
    borderRadius: "inherit",
  },
);

globalStyle("input:focus, textarea:focus, select:focus", {
  borderColor: `${vars.border.accent} !important`,
  boxShadow: `0 0 0 3px color-mix(in srgb, ${vars.border.accent} 35%, transparent) !important`,
});

globalStyle("input::placeholder, textarea::placeholder", {
  color: vars.typography.faint,
  opacity: 1,
});
