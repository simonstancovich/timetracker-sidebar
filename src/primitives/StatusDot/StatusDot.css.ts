import { keyframes, style, styleVariants } from '@vanilla-extract/css'
import { vars } from '../../theme'

const pulse = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.3 },
})

export const root = style({
  display: 'inline-block',
  borderRadius: '50%',
  flexShrink: 0,
})

export const size = styleVariants({
  '2xs': { width: 4, height: 4 },
  xs: { width: 5, height: 5 },
  sm: { width: 6, height: 6 },
  md: { width: 8, height: 8 },
  lg: { width: 10, height: 10 },
})

const STATUS_COLORS = {
  pink: vars.typography.pink,
  accent: vars.typography.accent,
  green: vars.typography.green,
  muted: vars.typography.tertiary,
  softBorder: vars.border.soft,
  warning: vars.typography.warning,
  error: vars.typography.error,
  onAccent: vars.typography.onAccent,
} as const

export const color = styleVariants(STATUS_COLORS, (v) => ({ background: v }))
export const glow = styleVariants(STATUS_COLORS, (v) => ({ boxShadow: `0 0 6px ${v}` }))

export const pulseClass = style({
  animation: `${pulse} 1.2s ease-in-out infinite`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
})
