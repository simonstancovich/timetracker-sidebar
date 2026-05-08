import { style, styleVariants } from '@vanilla-extract/css'
import { vars, sizes, spacing, radii, transitions } from '../../theme'

export const root = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: spacing.xs,
  height: sizes.sm,
  padding: `0 ${spacing.sm}px`,
  borderRadius: radii.pill,
  background: 'transparent',
  border: `1px solid ${vars.border.soft}`,
  color: 'inherit',
  font: 'inherit',
  cursor: 'pointer',
  transition: transitions.interactive,
})

// `highlight` paints the pill in a semantic tint — same-hue bg + border at
// low alpha. color-mix lets us derive the alpha overlays from the theme
// vars so light/dark pick the right underlying hue automatically.
export const highlight = styleVariants({
  pink: {
    background: `color-mix(in srgb, ${vars.typography.pink} 12%, transparent)`,
    borderColor: `color-mix(in srgb, ${vars.typography.pink} 33%, transparent)`,
  },
  accent: {
    background: `color-mix(in srgb, ${vars.typography.accent} 12%, transparent)`,
    borderColor: `color-mix(in srgb, ${vars.typography.accent} 33%, transparent)`,
  },
  green: {
    background: `color-mix(in srgb, ${vars.typography.green} 12%, transparent)`,
    borderColor: `color-mix(in srgb, ${vars.typography.green} 33%, transparent)`,
  },
})
