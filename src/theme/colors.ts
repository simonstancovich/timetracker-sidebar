import { shadows } from "./shadows";

export type Mode = "light" | "dark";

export const colors = {
  brand: {
    violet50: "#ede9fe",
    violet100: "#c4b5fd",
    violet200: "#9b8cff", // dark-mode accent
    violet300: "#7e6bff", // dark-mode button
    violet400: "#7c3aed", // light-mode accent / brand
    violet500: "#4c1d95", // light-mode accent text
    violet600: "#1e1b4b", // brand "ink"
  },

  typography: {
    white: "#ffffff",
    gray100: "#f5f3ff", // dark primary
    gray300: "#c4bedb", // dark secondary
    gray500: "#8b85a3", // dark tertiary
    gray700: "#5a5470", // dark faint
    inkFaint: "#9d98c8", // light faint
    inkMuted: "#544e8a", // light tertiary
    inkSoft: "#3e3878", // light secondary
    ink: "#1e1b4b", // light primary
    violet200: "#9b8cff", // dark accent text
    violet400: "#7c3aed", // light accent text
    violet500: "#d5cdff", // dark accent-on-accent-bg text
    pink400: "#e89aae", // dark pink
    pink500: "#be185d", // light pink
    pinkVivid: "#f472b6",
    green400: "#6fd4a0", // dark green
    green500: "#16a34a", // light green
  },

  background: {
    white: "#ffffff",
    pageLight: "#f8f7ff",
    pageDark: "#0b0910",
    surfaceLight: "#f1effc",
    surfaceDark: "rgba(255,255,255,0.04)",
    raisedLight: "#e8e4fa",
    raisedDark: "rgba(255,255,255,0.10)",
    glassDark: "rgba(255,255,255,0.065)",
    accentLight: "#ede9fe",
    accentDark: "rgba(155,140,255,0.12)",
    accentMutedLight: "#c4b5fd",
    accentMutedDark: "rgba(255,255,255,0.12)",
    pinkLight: "#fdf2f8",
    pinkDark: "rgba(232,154,174,0.07)",
    pinkPaperLight: "#fce7f3",
    pinkPaperDark: "rgba(232,154,174,0.18)",
    greenLight: "#f0fdf4",
    greenDark: "rgba(111,212,160,0.07)",
  },

  border: {
    softLight: "#e2dff5",
    softDark: "rgba(255,255,255,0.10)",
    strongLight: "#c4bfec",
    strongDark: "rgba(255,255,255,0.18)",
    greenLight: "#bbf7d0",
    greenDark: "rgba(111,212,160,0.25)",
  },

  chart: {
    light: ["#7c3aed", "#0891b2", "#be185d", "#0d9488"] as readonly string[],
    dark: ["#9b8cff", "#e89aae", "#6fd4a0", "#6ec0e8"] as readonly string[],
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
  | "pink"
  | "pinkVivid"
  | "green"
  | "onAccent";

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
  pink: { light: "pink500", dark: "pink400" },
  pinkVivid: { light: "pinkVivid", dark: "pinkVivid" },
  green: { light: "green500", dark: "green400" },
  onAccent: { light: "white", dark: "white" },
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
  | "green";

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
};

type BorderName = "soft" | "strong" | "green";

const BORDER_MAP: Record<
  BorderName,
  Record<Mode, keyof typeof colors.border>
> = {
  soft: { light: "softLight", dark: "softDark" },
  strong: { light: "strongLight", dark: "strongDark" },
  green: { light: "greenLight", dark: "greenDark" },
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
