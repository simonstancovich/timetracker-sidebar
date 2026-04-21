import { style, styleVariants } from '@vanilla-extract/css'
import {
  vars,
  sizes,
  radii,
  fontSize,
  fontWeight,
  transitions,
  opacity,
} from '../../theme'

export const root = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  fontWeight: fontWeight.bold,
  transition: transitions.interactive,
  selectors: {
    '&:disabled': { cursor: 'not-allowed', opacity: opacity.disabled },
  },
})

export const variant = styleVariants({
  // Subtle filled surface with a soft border — the default "tertiary action"
  // button (e.g. minimize, header utility controls).
  soft: {
    background: vars.background.surface,
    border: `1px solid ${vars.border.soft}`,
    color: vars.typography.tertiary,
  },
  // No surface; lives on top of existing content as an affordance only.
  ghost: {
    background: 'transparent',
    border: 'none',
    color: vars.typography.tertiary,
  },
})

export const size = styleVariants({
  sm: {
    width: sizes.sm,
    height: sizes.sm,
    borderRadius: radii.xs,
    fontSize: fontSize['2xs'],
  },
  md: {
    width: sizes.md,
    height: sizes.md,
    borderRadius: radii.sm,
    fontSize: fontSize.sm,
  },
})
