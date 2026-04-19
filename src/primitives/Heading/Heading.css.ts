import { style, styleVariants } from '@vanilla-extract/css'
import { vars, fontSize, fontWeight, lineHeight, letterSpacing } from '../../theme'

export const root = style({
  margin: 0,
  color: vars.typography.primary,
  fontFamily: vars.font.body,
  fontWeight: fontWeight.black,
  lineHeight: lineHeight.tight,
  letterSpacing: letterSpacing.tightest,
})

// Font size per semantic level. H1 is the biggest on-screen heading we
// currently use (login / intro / primary dashboard).
export const level = styleVariants({
  1: { fontSize: fontSize['4xl'] },   // 22
  2: { fontSize: fontSize['3xl'] },   // 18
  3: { fontSize: fontSize['2xl'] },   // 17
  4: { fontSize: fontSize.xl },       // 15
  5: { fontSize: fontSize.lg },       // 14
  6: { fontSize: fontSize.md },       // 13
})

export const color = styleVariants({
  primary:   { color: vars.typography.primary },
  secondary: { color: vars.typography.secondary },
  accent:    { color: vars.typography.accent },
  onAccent:  { color: vars.typography.onAccent },
})
