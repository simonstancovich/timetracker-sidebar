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
  sm: { width: 6, height: 6 },
  md: { width: 8, height: 8 },
  lg: { width: 10, height: 10 },
})

// Semantic status hues. `amber` and `red` are the only non-token values here —
// they're pure state signals (warning / error) that don't ride on theme
// typography.
export const color = styleVariants({
  pink: { background: vars.typography.pink },
  accent: { background: vars.typography.accent },
  green: { background: vars.typography.green },
  muted: { background: vars.typography.tertiary },
  amber: { background: '#f59e0b' },
  red: { background: '#ef4444' },
})

// When `glow` is true we overlay a same-hue shadow. Bound to the same keys as
// `color` so the glow always matches.
export const glow = styleVariants({
  pink: { boxShadow: `0 0 6px ${vars.typography.pink}` },
  accent: { boxShadow: `0 0 6px ${vars.typography.accent}` },
  green: { boxShadow: `0 0 6px ${vars.typography.green}` },
  muted: { boxShadow: `0 0 6px ${vars.typography.tertiary}` },
  amber: { boxShadow: '0 0 6px #f59e0b' },
  red: { boxShadow: '0 0 6px #ef4444' },
})

export const pulseClass = style({
  animation: `${pulse} 1.2s ease-in-out infinite`,
})
