import { style } from '@vanilla-extract/css'
import { vars, spacing, fontSize, fontWeight } from '../theme'

export const root = style({
  height: 40,
  flexShrink: 0,
  borderTop: `1px solid ${vars.border.soft}`,
  background: vars.background.page,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `0 ${spacing.lg}px`,
  gap: spacing.md,
})

export const modeGroup = style({
  display: 'flex',
  gap: 2,
  background: vars.background.raised,
  border: `1px solid ${vars.border.soft}`,
  borderRadius: 7,
  padding: 2,
})

export const modeBtn = style({
  width: 22,
  height: 22,
  borderRadius: 5,
  border: 'none',
  background: 'transparent',
  fontSize: fontSize.sm,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.typography.tertiary,
  padding: 0,
})

export const modeBtnActive = style({
  border: `1px solid ${vars.border.strong}`,
  background: vars.background.surface,
  color: vars.typography.primary,
})

const utilityBtnBase = {
  width: 22,
  height: 22,
  borderRadius: 5,
  background: vars.background.raised,
  border: `1px solid ${vars.border.soft}`,
  color: vars.typography.tertiary,
  fontSize: fontSize.base,
  cursor: 'pointer',
  padding: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
} as const

export const langBtn = style(utilityBtnBase)

export const pinBtn = style(utilityBtnBase)

export const pinBtnActive = style({
  background: `color-mix(in srgb, ${vars.typography.accent} 15%, transparent)`,
  border: `1px solid ${vars.typography.accent}`,
  color: vars.typography.accent,
})

export const helpBtn = style({
  ...utilityBtnBase,
  fontSize: fontSize.sm,
  fontWeight: fontWeight.bold,
})

export const signOutBtn = style({
  display: 'flex',
  alignItems: 'center',
  gap: spacing.xs,
  background: 'none',
  border: 'none',
  color: vars.typography.tertiary,
  fontSize: fontSize.base,
  cursor: 'pointer',
  padding: '4px 8px',
})
