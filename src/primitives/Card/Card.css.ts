import { style, styleVariants } from '@vanilla-extract/css'
import { vars, radii, spacing } from '../../theme'

export const root = style({
  background: vars.background.surface,
  border: `1px solid ${vars.border.soft}`,
})

export const tone = styleVariants({
  default: {},
  tinted: { background: vars.background.accent },
  accent: {
    background: vars.background.accent,
    border: `1px solid ${vars.typography.accent}`,
    boxShadow: `0 0 0 1px color-mix(in srgb, ${vars.typography.accent} 20%, transparent)`,
  },
})

export const radius = styleVariants({
  lg: { borderRadius: radii.lg },
  xl: { borderRadius: radii.xl },
})

export const pad = styleVariants({
  none: { padding: 0 },
  sm: { padding: '10px 12px' },
  md: { padding: spacing.md },
  lg: { padding: '14px 16px' },
})
