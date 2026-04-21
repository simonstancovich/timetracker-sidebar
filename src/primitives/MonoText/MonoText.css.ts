import { style, styleVariants } from '@vanilla-extract/css'
import { vars, fontSize, fontWeight, letterSpacing } from '../../theme'

export const root = style({
  fontFamily: vars.font.mono,
  margin: 0,
})

export const size = styleVariants({
  xs: { fontSize: fontSize.xs },
  sm: { fontSize: fontSize.sm },
  base: { fontSize: fontSize.base },
  md: { fontSize: fontSize.md },
  lg: { fontSize: fontSize.lg },
})

export const weight = styleVariants({
  normal: { fontWeight: fontWeight.normal },
  medium: { fontWeight: fontWeight.medium },
  semibold: { fontWeight: fontWeight.semibold },
  bold: { fontWeight: fontWeight.bold },
  black: { fontWeight: fontWeight.black },
})

export const color = styleVariants(vars.typography, (v) => ({ color: v }))

export const tracking = styleVariants({
  normal: { letterSpacing: letterSpacing.normal },
  wide: { letterSpacing: letterSpacing.wide },
  wider: { letterSpacing: letterSpacing.wider },
})
