import { keyframes, style, styleVariants } from '@vanilla-extract/css'
import { vars, sizes, spacing, fontSize, letterSpacing, duration, easing } from '../../theme'

const spin = keyframes({
  to: { transform: 'rotate(360deg)' },
})

const wrapperBase = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: spacing.md,
})

export const wrapper = styleVariants({
  inline: [wrapperBase, { padding: spacing.md }],
  fill: [
    wrapperBase,
    {
      padding: spacing.xl,
      minHeight: '100vh',
      background: vars.background.page,
    },
  ],
})

export const disc = style({
  borderStyle: 'solid',
  borderColor: vars.border.soft,
  borderTopColor: vars.typography.accent,
  borderRadius: '50%',
  animation: `${spin} ${duration.slow}ms ${easing.linear} infinite`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
})

export const size = styleVariants({
  sm: { width: sizes.xs, height: sizes.xs, borderWidth: 2 },
  md: { width: sizes.sm, height: sizes.sm, borderWidth: 3 },
  lg: { width: sizes.md, height: sizes.md, borderWidth: 3 },
})

export const label = style({
  color: vars.typography.faint,
  fontSize: fontSize.base,
  letterSpacing: letterSpacing.wide,
})
