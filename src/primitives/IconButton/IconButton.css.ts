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

// Small status indicator pinned just outside the top-right corner.
export const badge = style({
  position: 'absolute',
  top: -2,
  right: 2,
  pointerEvents: 'none',
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
  // Transparent, content-sized button wrapping a graphic (e.g. the activity
  // ring). Press-scale feedback instead of a surface/border change; the
  // `relative` anchor lets a child badge position against it.
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
  // Sized by its content (no fixed box); circular hit area.
  fit: {
    padding: 0,
    borderRadius: radii.circle,
  },
})
