import { style, styleVariants } from '@vanilla-extract/css'
import { vars, fontSize, fontWeight, spacing, transitions, letterSpacing } from '../../theme'

export const root = style({
  flex: 1,
  padding: `${spacing.sm}px 0 ${spacing.md}px`,
  border: 'none',
  borderBottom: '2px solid transparent',
  background: 'transparent',
  fontFamily: vars.font.body,
  fontSize: fontSize.sm,
  fontWeight: fontWeight.semibold,
  textTransform: 'uppercase',
  letterSpacing: letterSpacing.looser,
  cursor: 'pointer',
  transition: transitions.interactive,
})

export const state = styleVariants({
  selected: {
    color: vars.typography.primary,
    fontWeight: fontWeight.bold,
    borderBottomColor: vars.typography.accent,
  },
  unselected: {
    color: vars.typography.tertiary,
  },
})
