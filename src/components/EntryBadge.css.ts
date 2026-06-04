import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../theme";

export const base = style({
  display: "inline-flex",
  alignItems: "center",
  height: 16,
  padding: "0 6px",
  borderRadius: 4,
  letterSpacing: 0.5,
  textTransform: "uppercase",
  lineHeight: 1,
  whiteSpace: "nowrap",
  vars: {
    "--live-pulse-ring": `color-mix(in srgb, ${vars.typography.pink} 40%, transparent)`,
  },
  selectors: {
    "&&": { fontSize: 9, fontWeight: 700 },
  },
});

export const tone = styleVariants({
  billable: {
    background: `color-mix(in srgb, ${vars.typography.accent} 15%, transparent)`,
    border: `1px solid color-mix(in srgb, ${vars.typography.accent} 33%, transparent)`,
    selectors: { "&&": { color: vars.typography.accent } },
  },
  internal: {
    background: "transparent",
    border: `1px solid ${vars.border.soft}`,
    selectors: { "&&": { color: vars.typography.faint } },
  },
  pending: {
    background: `color-mix(in srgb, ${vars.typography.warning} 15%, transparent)`,
    border: `1px solid color-mix(in srgb, ${vars.typography.warning} 33%, transparent)`,
    selectors: { "&&": { color: vars.typography.warningInk } },
  },
  failed: {
    background: `color-mix(in srgb, ${vars.typography.error} 15%, transparent)`,
    border: `1px solid color-mix(in srgb, ${vars.typography.error} 33%, transparent)`,
    selectors: { "&&": { color: vars.typography.error } },
  },
  live: {
    background: `color-mix(in srgb, ${vars.typography.pink} 15%, transparent)`,
    border: `1px solid color-mix(in srgb, ${vars.typography.pink} 33%, transparent)`,
    selectors: { "&&": { color: vars.typography.pink } },
  },
  paused: {
    background: vars.background.raised,
    border: `1px solid ${vars.border.soft}`,
    selectors: { "&&": { color: vars.typography.tertiary } },
  },
});
