import { style, styleVariants } from '@vanilla-extract/css'
import { vars } from '../../theme'

export const root = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: vars.typography.accent,
  color: vars.typography.onAccent,
  boxShadow: vars.shadow.brand,
})

export const size = styleVariants({
  sm: { width: 24, height: 24, borderRadius: 8,  fontSize: 14 },
  md: { width: 32, height: 32, borderRadius: 10, fontSize: 18 },
  lg: { width: 48, height: 48, borderRadius: 14, fontSize: 22 },
  xl: { width: 64, height: 64, borderRadius: 18, fontSize: 28 },
})
