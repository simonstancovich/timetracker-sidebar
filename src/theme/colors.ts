export type Mode = "light" | "dark";

export const colors = {
  // Brand slot now carries terracotta. Names kept as "violet*" so the theme
  // mapping layer doesn't need to change while we're trying palettes.
  brand: {
    violet50: "#f9ece5",
    violet100: "#e5b098",
    violet200: "#ef9b78", // dark-mode accent
    violet300: "#d47f5a", // dark-mode button
    violet400: "#c96442", // light-mode accent / brand
    violet500: "#7c3817", // light-mode accent text
    violet600: "#3c1f12", // brand "ink"
  },

  typography: {
    white: "#ffffff",
    gray100: "#faf8ff", // dark primary
    gray300: "#d0c9e8", // dark secondary
    gray500: "#968fb0", // dark tertiary
    gray700: "#847e9e", // dark faint
    // Light stack: near-neutral with a barely-warm undertone. Stops the
    // "sandy" effect (warm chrome + warm accent = dune wash) by pulling
    // chrome off the warm axis while the accent stays warm.
    inkFaint: "#8e8a85", // light faint
    inkMuted: "#686561", // light tertiary
    inkSoft: "#484340", // light secondary
    ink: "#1e1a17", // light primary
    violet200: "#ef9b78", // dark accent text (terracotta)
    violet400: "#c96442", // light accent text (terracotta)
    violet500: "#f4d4c3", // dark accent-on-accent-bg text
    // Deep terracotta — text color for text sitting on a tinted accent bg in
    // light mode (paired with violet500 in dark, which is the cream above).
    accentInk: "#7c3817",
    // "pink" slot is now dusty rose — warm but different hue than terracotta,
    // so the two don't melt into each other.
    pink400: "#ed93a6", // dark rose
    pink500: "#a33553", // light rose
    pinkVivid: "#c94369",
    green400: "#74dba6", // dark green
    green500: "#16a34a", // light green
    error: "#ef4444", // tailwind red-500, both modes
    warning: "#f59e0b", // tailwind amber-500, both modes
    urgent: "#ea580c", // tailwind orange-600, both modes
    soon: "#d97706", // tailwind amber-600, both modes
    // Error text legible on the translucent-red failstate strip (RetryStrip):
    // darker red on the pale light bg, softer red on the dark bg.
    dangerStrong: "#b91c1c", // light
    dangerSoft: "#fca5a5", // dark
    warningInkLight: "#b45309", // amber-700, for text on warning-tinted bg in light mode
    warningInkDark: "#fbbf24",  // amber-400, for text on warning-tinted bg in dark mode
    // Deep "ink" colors for text sitting on the tinted month-heatmap cells
    // (light mode); chosen for legibility on the pale green/amber/red fills.
    forestInk: "#0f4d2a", // hit-goal text
    amberInk: "#925706", // partial-day text
    redInk: "#b1170a", // missed-workday text
  },

  background: {
    white: "#ffffff",
    // Crisp near-white canvas with only a whisper of warm. Value-based
    // elevation, not saturation — avoids the dune/sand wash of the earlier
    // warm-paper attempt.
    pageLight: "#fdfcfb",
    pageDark: "#0b0910",
    surfaceLight: "#f0ebe2",
    surfaceDark: "rgba(255,255,255,0.045)",
    raisedLight: "#e3dccf",
    raisedDark: "rgba(255,255,255,0.10)",
    glassDark: "rgba(170,150,228,0.08)",
    // Accent tinted bgs stay terracotta.
    accentLight: "#f9ece5",
    accentDark: "rgba(239,155,120,0.15)",
    accentMutedLight: "#e5b098",
    accentMutedDark: "rgba(239,155,120,0.24)",
    // "pink" bgs now dusty rose.
    pinkLight: "#fbe9ee",
    pinkDark: "rgba(232,143,161,0.10)",
    pinkPaperLight: "#f6d0da",
    pinkPaperDark: "rgba(232,143,161,0.22)",
    greenLight: "#f0fdf4",
    greenDark: "rgba(111,212,160,0.07)",
    warningLight: "rgba(245,158,11,0.08)",
    warningDark: "rgba(245,158,11,0.08)",
    urgentLight: "#ff7a00",
    urgentDark: "#ff7a00",
    dangerLight: "#ff1f1f",
    dangerDark: "#ff1f1f",
    skeletonLight: "rgba(140,140,160,0.18)",
    skeletonDark: "rgba(140,140,160,0.18)",
    scrimLight: "rgba(0,0,0,0.6)",
    scrimDark: "rgba(0,0,0,0.6)",
  },

  border: {
    // Near-neutral dividers, barely-warm.
    softLight: "#d4cec4",
    softDark: "rgba(166,146,214,0.17)",
    strongLight: "#bdb6a8",
    strongDark: "rgba(166,146,214,0.30)",
    greenLight: "#bbf7d0",
    greenDark: "rgba(111,212,160,0.25)",
    pinkLight: "#e0bcc6",
    pinkDark: "rgba(232,143,161,0.25)",
    warningLight: "rgba(245,158,11,0.3)",
    warningDark: "rgba(245,158,11,0.3)",
    // Mirrors brand.violet400 / violet200 — kept in the border namespace so
    // accent-colored borders (focus/active states) can be sourced semantically.
    accentLight: "#c96442",
    accentDark: "#ef9b78",
  },

  chart: {
    light: ["#c96442", "#a33553", "#b88527", "#6f8f5f"] as readonly string[],
    dark: ["#ef9b78", "#ed93a6", "#e8c060", "#9bbf85"] as readonly string[],
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
  | "warning"
  | "urgent"
  | "soon"
  | "danger";

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
  urgent: { light: "urgent", dark: "urgent" },
  soon: { light: "soon", dark: "soon" },
  danger: { light: "dangerStrong", dark: "dangerSoft" },
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
  | "warning"
  | "urgent"
  | "danger"
  | "skeleton"
  | "scrim";

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
  urgent: { light: "urgentLight", dark: "urgentDark" },
  danger: { light: "dangerLight", dark: "dangerDark" },
  skeleton: { light: "skeletonLight", dark: "skeletonDark" },
  scrim: { light: "scrimLight", dark: "scrimDark" },
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
