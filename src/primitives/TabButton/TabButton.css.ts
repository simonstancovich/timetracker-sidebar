import { style, styleVariants } from '@vanilla-extract/css'
import { vars, fontSize, fontWeight, spacing, transitions } from '../../theme'

export const root = style({
  flex: 1,
  padding: `${spacing.sm}px 0`,
  border: 'none',
  borderBottom: '2px solid transparent',
  background: 'transparent',
  fontFamily: vars.font.body,
  fontSize: fontSize.base,
  cursor: 'pointer',
  transition: transitions.interactive,
  // Overlap the tablist's 1px bottom border so the active underline joins it.
  marginBottom: -1,
})

export const state = styleVariants({
  selected: {
    color: vars.typography.primary,
    fontWeight: fontWeight.bold,
    borderBottomColor: vars.typography.accent,
  },
  unselected: {
    color: vars.typography.tertiary,
    fontWeight: fontWeight.medium,
  },
})
