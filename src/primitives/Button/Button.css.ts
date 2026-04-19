import { style, styleVariants } from '@vanilla-extract/css'
import { vars, fontSize, fontWeight, radii, spacing } from '../../theme'

export const root = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: vars.font.body,
  fontWeight: fontWeight.bold,
  border: 'none',
  cursor: 'pointer',
  transition: 'background 150ms ease, box-shadow 150ms ease',
  selectors: {
    '&:disabled': { cursor: 'not-allowed', opacity: 0.5 },
  },
})

// Only one variant for now — more land as we migrate components that need them.
export const variant = styleVariants({
  primary: {
    background: vars.typography.accent,
    color: vars.typography.onAccent,
    boxShadow: vars.shadow.brand,
  },
})

export const size = styleVariants({
  md: {
    padding: `${spacing.md}px ${spacing.xl}px`,
    fontSize: fontSize.lg,
    borderRadius: radii['3xl'],
  },
})
