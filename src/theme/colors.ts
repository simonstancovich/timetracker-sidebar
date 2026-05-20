import { shadows } from "./shadows";

export type Mode = "light" | "dark";

export const colors = {
  // Brand slot now carries terracotta. Names kept as "violet*" so the theme
  // mapping layer doesn't need to change while we're trying palettes.
  brand: {
    violet50: "#f9ece5",
    violet100: "#e5b098",
    violet200: "#e89472", // dark-mode accent
    violet300: "#d47f5a", // dark-mode button
    violet400: "#c96442", // light-mode accent / brand
    violet500: "#7c3817", // light-mode accent text
    violet600: "#3c1f12", // brand "ink"
  },

  typography: {
    white: "#ffffff",
    gray100: "#f5f3ff", // dark primary
    gray300: "#c4bedb", // dark secondary
    gray500: "#8b85a3", // dark tertiary
    gray700: "#5a5470", // dark faint
    // Light stack: near-neutral with a barely-warm undertone. Stops the
    // "sandy" effect (warm chrome + warm accent = dune wash) by pulling
    // chrome off the warm axis while the accent stays warm.
    inkFaint: "#a8a5a0", // light faint
    inkMuted: "#73706c", // light tertiary
    inkSoft: "#484340", // light secondary
    ink: "#1e1a17", // light primary
    violet200: "#e89472", // dark accent text (terracotta)
    violet400: "#c96442", // light accent text (terracotta)
    violet500: "#f4d4c3", // dark accent-on-accent-bg text
    // Deep terracotta — text color for text sitting on a tinted accent bg in
    // light mode (paired with violet500 in dark, which is the cream above).
    accentInk: "#7c3817",
    // "pink" slot is now dusty rose — warm but different hue than terracotta,
    // so the two don't melt into each other.
    pink400: "#e88fa1", // dark rose
    pink500: "#a33553", // light rose
    pinkVivid: "#c94369",
    green400: "#6fd4a0", // dark green
    green500: "#16a34a", // light green
    error: "#ef4444", // tailwind red-500, both modes
    warning: "#f59e0b", // tailwind amber-500, both modes
  },

  background: {
    white: "#ffffff",
    // Crisp near-white canvas with only a whisper of warm. Value-based
    // elevation, not saturation — avoids the dune/sand wash of the earlier
    // warm-paper attempt.
    pageLight: "#fdfcfb",
    pageDark: "#0b0910",
    surfaceLight: "#f6f4f1",
    surfaceDark: "rgba(255,255,255,0.04)",
    raisedLight: "#ebe8e3",
    raisedDark: "rgba(255,255,255,0.10)",
    glassDark: "rgba(255,255,255,0.065)",
    // Accent tinted bgs stay terracotta.
    accentLight: "#f9ece5",
    accentDark: "rgba(232,148,114,0.12)",
    accentMutedLight: "#e5b098",
    accentMutedDark: "rgba(232,148,114,0.24)",
    // "pink" bgs now dusty rose.
    pinkLight: "#fbe9ee",
    pinkDark: "rgba(232,143,161,0.10)",
    pinkPaperLight: "#f6d0da",
    pinkPaperDark: "rgba(232,143,161,0.22)",
    greenLight: "#f0fdf4",
    greenDark: "rgba(111,212,160,0.07)",
    warningLight: "rgba(245,158,11,0.08)",
    warningDark: "rgba(245,158,11,0.08)",
  },

  border: {
    // Near-neutral dividers, barely-warm.
    softLight: "#e5e1db",
    softDark: "rgba(255,255,255,0.10)",
    strongLight: "#d0ccc4",
    strongDark: "rgba(255,255,255,0.18)",
    greenLight: "#bbf7d0",
    greenDark: "rgba(111,212,160,0.25)",
    pinkLight: "#e0bcc6",
    pinkDark: "rgba(232,143,161,0.25)",
    warningLight: "rgba(245,158,11,0.3)",
    warningDark: "rgba(245,158,11,0.3)",
    // Mirrors brand.violet400 / violet200 — kept in the border namespace so
    // accent-colored borders (focus/active states) can be sourced semantically.
    accentLight: "#c96442",
    accentDark: "#e89472",
  },

  chart: {
    light: ["#c96442", "#a33553", "#b88527", "#6f8f5f"] as readonly string[],
    dark: ["#e89472", "#e88fa1", "#e8c060", "#9bbf85"] as readonly string[],
  },
} as const;

// Used at call sites that still need ad-hoc translucency (legacy inline styles).
export const alpha = (channel: "white" | "black", a: number) =>
  channel === "white" ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`;

type TypoName =
  | "primary"
  | "secondary"
  | "tertiary"
  | "faint"
  | "accent"
  | "accentStrong"
  | "accentInk"
  | "pink"
  | "pinkVivid"
  | "green"
  | "onAccent"
  | "error"
  | "warning";

const TYPOGRAPHY_MAP: Record<
  TypoName,
  Record<Mode, keyof typeof colors.typography>
> = {
  primary: { light: "ink", dark: "gray100" },
  secondary: { light: "inkSoft", dark: "gray300" },
  tertiary: { light: "inkMuted", dark: "gray500" },
  faint: { light: "inkFaint", dark: "gray700" },
  accent: { light: "violet400", dark: "violet200" },
  accentStrong: { light: "violet400", dark: "violet500" },
  accentInk: { light: "accentInk", dark: "violet500" },
  pink: { light: "pink500", dark: "pink400" },
  pinkVivid: { light: "pinkVivid", dark: "pinkVivid" },
  green: { light: "green500", dark: "green400" },
  onAccent: { light: "white", dark: "white" },
  error: { light: "error", dark: "error" },
  warning: { light: "warning", dark: "warning" },
};

type BgName =
  | "page"
  | "surface"
  | "raised"
  | "glass"
  | "accent"
  | "accentMuted"
  | "pink"
  | "pinkPaper"
  | "green"
  | "warning";

const BACKGROUND_MAP: Record<
  BgName,
  Record<Mode, keyof typeof colors.background>
> = {
  page: { light: "pageLight", dark: "pageDark" },
  surface: { light: "white", dark: "glassDark" },
  raised: { light: "surfaceLight", dark: "surfaceDark" },
  glass: { light: "raisedLight", dark: "raisedDark" },
  accent: { light: "accentLight", dark: "accentDark" },
  accentMuted: { light: "accentMutedLight", dark: "accentMutedDark" },
  pink: { light: "pinkLight", dark: "pinkDark" },
  pinkPaper: { light: "pinkPaperLight", dark: "pinkPaperDark" },
  green: { light: "greenLight", dark: "greenDark" },
  warning: { light: "warningLight", dark: "warningDark" },
};

type BorderName = "soft" | "strong" | "green" | "pink" | "accent" | "warning";

const BORDER_MAP: Record<
  BorderName,
  Record<Mode, keyof typeof colors.border>
> = {
  soft: { light: "softLight", dark: "softDark" },
  strong: { light: "strongLight", dark: "strongDark" },
  green: { light: "greenLight", dark: "greenDark" },
  pink: { light: "pinkLight", dark: "pinkDark" },
  accent: { light: "accentLight", dark: "accentDark" },
  warning: { light: "warningLight", dark: "warningDark" },
};

export function pickColor(
  category: "typography",
  name: TypoName,
  mode: Mode,
): string;
export function pickColor(
  category: "background",
  name: BgName,
  mode: Mode,
): string;
export function pickColor(
  category: "border",
  name: BorderName,
  mode: Mode,
): string;
export function pickColor(
  category: "typography" | "background" | "border",
  name: string,
  mode: Mode,
): string {
  if (category === "typography")
    return colors.typography[TYPOGRAPHY_MAP[name as TypoName][mode]];
  if (category === "background")
    return colors.background[BACKGROUND_MAP[name as BgName][mode]];
  return colors.border[BORDER_MAP[name as BorderName][mode]];
}

export const chartColors = (mode: Mode) => colors.chart[mode];

export const light = {
  id: "light",
  bg: colors.background.pageLight,
  s1: colors.background.white,
  s2: colors.background.surfaceLight,
  s3: colors.background.raisedLight,
  b1: colors.border.softLight,
  b2: colors.border.strongLight,
  ac: colors.brand.violet400,
  ad: colors.background.accentLight,
  at: colors.brand.violet500,
  am: colors.background.accentMutedLight,
  pk: colors.typography.pink500,
  pb: colors.background.pinkLight,
  pp: colors.background.pinkPaperLight,
  pv: colors.typography.pinkVivid,
  gn: colors.typography.green500,
  gb: colors.background.greenLight,
  gd: colors.border.greenLight,
  t1: colors.typography.ink,
  t2: colors.typography.inkSoft,
  t3: colors.typography.inkMuted,
  tf: colors.typography.inkFaint,
  lo: colors.brand.violet400,
  btn: colors.brand.violet400,
  bsh: shadows.brand,
  co: colors.chart.light,
} as const;

export const dark = {
  id: "dark",
  bg: colors.background.pageDark,
  s1: colors.background.glassDark,
  s2: colors.background.surfaceDark,
  s3: colors.background.raisedDark,
  b1: colors.border.softDark,
  b2: colors.border.strongDark,
  ac: colors.brand.violet200,
  ad: colors.background.accentDark,
  at: colors.typography.violet500,
  am: colors.background.accentMutedDark,
  pk: colors.typography.pink400,
  pb: colors.background.pinkDark,
  pp: colors.background.pinkPaperDark,
  pv: colors.typography.pink400,
  gn: colors.typography.green400,
  gb: colors.background.greenDark,
  gd: colors.border.greenDark,
  t1: colors.typography.gray100,
  t2: colors.typography.gray300,
  t3: colors.typography.gray500,
  tf: colors.typography.gray700,
  lo: colors.background.white,
  btn: colors.brand.violet300,
  bsh: shadows.heavy,
  co: colors.chart.dark,
} as const;

export type Theme = typeof light | typeof dark;
export const themes: Record<Mode, Theme> = { light, dark };
