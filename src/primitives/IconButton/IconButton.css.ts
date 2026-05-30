import { style, styleVariants } from '@vanilla-extract/css'
import {
  vars,
  sizes,
  radii,
  fontSize,
  fontWeight,
  transitions,
  duration,
  easing,
  opacity,
} from '../../theme'

export const root = style({
  position: 'relative',
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

export const badge = style({
  position: 'absolute',
  top: -2,
  right: 2,
  pointerEvents: 'none',
})

export const variant = styleVariants({
  soft: {
    background: vars.background.surface,
    border: `1px solid ${vars.border.soft}`,
    color: vars.typography.tertiary,
  },
  ghost: {
    background: 'transparent',
    border: 'none',
    color: vars.typography.tertiary,
  },
  ring: {
    background: 'transparent',
    border: 'none',
    transition: `transform ${duration.quick}ms ${easing.standard}`,
    selectors: {
      '&:hover': { transform: 'scale(1.04)' },
      '&:active': { transform: 'scale(0.97)' },
    },
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
  fit: {
    padding: 0,
    borderRadius: radii.circle,
  },
})
