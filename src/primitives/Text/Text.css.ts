import { style, styleVariants } from '@vanilla-extract/css'
import { vars, fontSize, lineHeight } from '../../theme'

export const root = style({
  margin: 0,
  fontFamily: vars.font.body,
  fontSize: fontSize.md,
  lineHeight: lineHeight.relaxed,
})

// Color names map onto `vars.typography.*` — the same semantic names that
// `pickColor('typography', …)` accepts, so the prop API feels consistent.
export const color = styleVariants({
  primary:      { color: vars.typography.primary },
  secondary:    { color: vars.typography.secondary },
  tertiary:     { color: vars.typography.tertiary },
  faint:        { color: vars.typography.faint },
  accent:       { color: vars.typography.accent },
  accentStrong: { color: vars.typography.accentStrong },
  pink:         { color: vars.typography.pink },
  pinkVivid:    { color: vars.typography.pinkVivid },
  green:        { color: vars.typography.green },
  onAccent:     { color: vars.typography.onAccent },
})

export const align = styleVariants({
  left:   { textAlign: 'left' },
  center: { textAlign: 'center' },
  right:  { textAlign: 'right' },
})
