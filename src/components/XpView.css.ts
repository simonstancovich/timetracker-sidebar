import { style, styleVariants } from "@vanilla-extract/css";
import { vars, radii, spacing } from "../theme";
import { ACH_TONE_COLOR } from "../lib/achievements";

export const levelNumber = style({
  fontSize: 92,
  lineHeight: 0.9,
  letterSpacing: -3,
});

export const coach = style({
  paddingInline: spacing.sm,
});

export const chart = style({
  height: 90,
});

export const bar = style({
  position: "relative",
  borderRadius: radii.xs,
});

export const barFuture = style({
  border: `1px dashed ${vars.border.soft}`,
});

export const barMissed = style({
  border: `1px dashed color-mix(in srgb, ${vars.typography.error} 35%, transparent)`,
  background: `color-mix(in srgb, ${vars.typography.error} 6%, transparent)`,
});

export const achTone = styleVariants(ACH_TONE_COLOR, (c) => ({
  vars: { "--ach-co": c },
}));

export const achCard = style({
  padding: "12px 6px 10px",
  border: `1px solid ${vars.border.soft}`,
  borderRadius: radii.md,
  opacity: 0.45,
});

export const achTeaser = style({
  opacity: 0.62,
});

export const achCardOn = style({
  opacity: 1,
  borderColor: "color-mix(in srgb, var(--ach-co) 40%, transparent)",
  background: "color-mix(in srgb, var(--ach-co) 7%, transparent)",
});

export const achEmoji = style({
  fontSize: 22,
  lineHeight: 1,
});

export const achEmojiMuted = style({
  filter: "grayscale(1)",
});

export const achLabel = style({
  overflowWrap: "break-word",
  hyphens: "auto",
});

export const achName = style({
  color: "var(--ach-co)",
});

export const achXp = style({
  color: "var(--ach-co)",
});
