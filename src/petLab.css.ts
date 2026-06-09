import { globalStyle, style } from "@vanilla-extract/css";

globalStyle("html, body, #root", {
  margin: 0,
  padding: 0,
  background: "transparent",
});

globalStyle("body", {
  fontFamily: "'Instrument Serif', serif",
});

globalStyle("*", {
  boxSizing: "border-box",
});

const LIGHT_BG = "#fdfcfb";
const LIGHT_TEXT = "#1a1612";
const LIGHT_MUTED = "#8a7d70";
const LIGHT_BORDER = "rgba(26,22,18,0.12)";
const LIGHT_SURFACE = "#ffffff";

const DARK_BG = "#0b0910";
const DARK_TEXT = "#f0ebe5";
const DARK_MUTED = "#7d7384";
const DARK_BORDER = "rgba(240,235,229,0.12)";
const DARK_SURFACE = "#15101e";

const RARITY_COMMON = "#8a8780";
const RARITY_RARE = "#3e7ec9";
const RARITY_EPIC = "#a44ec9";
const RARITY_UNIQUE = "#d49a2c";
const RARITY_LIMITED = "#e58a98";

const baseTheme = style({
  minHeight: "100vh",
  fontFamily: "'Instrument Serif', serif",
  padding: "32px 28px 64px",
  display: "flex",
  flexDirection: "column",
  gap: 32,
});

export const themeLight = style([
  baseTheme,
  {
    background: LIGHT_BG,
    color: LIGHT_TEXT,
    vars: {
      "--lab-muted": LIGHT_MUTED,
      "--lab-border": LIGHT_BORDER,
      "--lab-surface": LIGHT_SURFACE,
    },
  },
]);

export const themeDark = style([
  baseTheme,
  {
    background: DARK_BG,
    color: DARK_TEXT,
    vars: {
      "--lab-muted": DARK_MUTED,
      "--lab-border": DARK_BORDER,
      "--lab-surface": DARK_SURFACE,
    },
  },
]);

export const topBar = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  paddingBottom: 8,
  borderBottom: "1px solid var(--lab-border)",
});

export const title = style({
  fontSize: 40,
  fontStyle: "italic",
  letterSpacing: -1,
  margin: 0,
});

export const controls = style({
  display: "flex",
  gap: 8,
  fontFamily: "'JetBrains Mono', monospace",
});

export const btn = style({
  background: "transparent",
  color: "inherit",
  border: "1px solid var(--lab-border)",
  borderRadius: 6,
  padding: "4px 10px",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: 0.6,
  textTransform: "uppercase",
  fontFamily: "inherit",
  cursor: "pointer",
  selectors: {
    "&:hover": { background: "var(--lab-surface)" },
  },
});

export const intent = style({
  display: "flex",
  flexDirection: "column",
});

export const intentLine = style({
  margin: 0,
  fontSize: 14,
  fontStyle: "italic",
  color: "var(--lab-muted)",
  maxWidth: 720,
});

export const allRarities = style({
  display: "flex",
  flexDirection: "column",
  gap: 36,
});

export const raritySection = style({
  display: "flex",
  flexDirection: "column",
  gap: 16,
});

export const rarityHeader = style({
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  paddingBottom: 6,
  borderBottom: "2px solid",
  selectors: {
    '&[data-rarity="common"]': { borderColor: RARITY_COMMON },
    '&[data-rarity="rare"]': { borderColor: RARITY_RARE },
    '&[data-rarity="epic"]': { borderColor: RARITY_EPIC },
    '&[data-rarity="unique"]': { borderColor: RARITY_UNIQUE },
    '&[data-rarity="limited"]': { borderColor: RARITY_LIMITED },
  },
});

export const rarityTitle = style({
  fontSize: 28,
  fontStyle: "italic",
  letterSpacing: -0.6,
  margin: 0,
});

export const rarityCount = style({
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: 1.4,
  color: "var(--lab-muted)",
});

export const creatureGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
  gap: 20,
});

export const creatureCard = style({
  display: "flex",
  flexDirection: "column",
  gap: 14,
  padding: "18px 18px 22px",
  background: "var(--lab-surface)",
  border: "1px solid var(--lab-border)",
  borderRadius: 14,
});

export const creatureHeader = style({
  display: "flex",
  flexDirection: "column",
  gap: 4,
  paddingBottom: 8,
  borderBottom: "1px solid var(--lab-border)",
});

export const creatureHeading = style({
  display: "flex",
  alignItems: "center",
  gap: 10,
});

export const creatureName = style({
  fontSize: 22,
  fontStyle: "italic",
  letterSpacing: -0.4,
  margin: 0,
});

export const rarityChip = style({
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 9,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: 1.2,
  padding: "2px 8px",
  borderRadius: 999,
  color: "#fff",
  selectors: {
    '&[data-rarity="common"]': { background: RARITY_COMMON },
    '&[data-rarity="rare"]': { background: RARITY_RARE },
    '&[data-rarity="epic"]': { background: RARITY_EPIC },
    '&[data-rarity="unique"]': { background: RARITY_UNIQUE, color: "#1a1208" },
    '&[data-rarity="limited"]': { background: RARITY_LIMITED, color: "#3a1418" },
  },
});

export const creatureFlavor = style({
  margin: 0,
  fontSize: 13,
  fontStyle: "italic",
  color: "var(--lab-muted)",
});

export const animBlock = style({
  display: "flex",
  flexDirection: "column",
  gap: 8,
});

export const animMeta = style({
  display: "flex",
  alignItems: "baseline",
  gap: 12,
  fontFamily: "'JetBrains Mono', monospace",
});

export const animKindLabel = style({
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: 1.2,
});

export const animKindDetail = style({
  fontSize: 9,
  color: "var(--lab-muted)",
  letterSpacing: 0.6,
});

export const sizeRow = style({
  display: "flex",
  alignItems: "flex-end",
  gap: 14,
  flexWrap: "wrap",
});

export const sizeCell = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 4,
});

export const sizeLabel = style({
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 9,
  color: "var(--lab-muted)",
  letterSpacing: 0.8,
  textTransform: "uppercase",
});

export const framesRow = style({
  display: "flex",
  alignItems: "center",
  gap: 12,
  paddingTop: 6,
  borderTop: "1px dashed var(--lab-border)",
  flexWrap: "wrap",
});

export const frameCell = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 4,
});

export const frameIndexLabel = style({
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 9,
  color: "var(--lab-muted)",
});
