import { style, styleVariants } from '@vanilla-extract/css'
import { vars, sizes, radii, fontSize } from '../../theme'

export const root = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: vars.typography.accent,
  color: vars.typography.onAccent,
  boxShadow: vars.shadow.brand,
})

export const size = styleVariants({
  sm: { width: sizes.sm, height: sizes.sm, borderRadius: radii.sm,    fontSize: fontSize.lg },
  md: { width: sizes.md, height: sizes.md, borderRadius: radii.md,    fontSize: fontSize['3xl'] },
  lg: { width: sizes.lg, height: sizes.lg, borderRadius: radii.xl,    fontSize: fontSize['4xl'] },
  xl: { width: sizes.xl, height: sizes.xl, borderRadius: radii['2xl'],fontSize: fontSize.display },
})
