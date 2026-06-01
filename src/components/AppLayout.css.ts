import { style, styleVariants } from '@vanilla-extract/css'
import { vars } from '../theme'

export const root = style({
  color: vars.typography.primary,
})

export const modeVariant = styleVariants({
  light: { background: vars.background.page },
  dark: {},
})
