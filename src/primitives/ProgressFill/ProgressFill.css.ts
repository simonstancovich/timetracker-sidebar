import { style, styleVariants } from '@vanilla-extract/css'
import { vars } from '../../theme'

export const root = style({
  position: 'absolute',
  left: 0,
  top: 0,
  bottom: 0,
  pointerEvents: 'none',
})

export const tone = styleVariants({
  accent: {
    backgroundImage: `linear-gradient(90deg, color-mix(in srgb, ${vars.typography.accent} 4%, transparent) 0%, color-mix(in srgb, ${vars.typography.accent} 11%, transparent) 50%, color-mix(in srgb, ${vars.typography.accent} 4%, transparent) 100%)`,
  },
  done: {
    backgroundImage: `linear-gradient(90deg, color-mix(in srgb, ${vars.typography.green} 7%, transparent) 0%, color-mix(in srgb, ${vars.typography.green} 13%, transparent) 50%, color-mix(in srgb, ${vars.typography.green} 7%, transparent) 100%)`,
  },
})
