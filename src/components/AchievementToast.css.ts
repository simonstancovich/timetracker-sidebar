import { keyframes, style, styleVariants } from '@vanilla-extract/css'
import { vars, fontSize, fontWeight, letterSpacing, radii, spacing } from '../theme'
import { ACH_TONE_COLOR } from '../lib/achievements'

const achIn = keyframes({
  '0%': { opacity: 0, transform: 'translateY(18px) scale(.95)' },
  '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
})

export const tone = styleVariants(ACH_TONE_COLOR, (c) => ({ vars: { '--ach-co': c } }))

export const root = style({
  position: 'absolute',
  bottom: 14,
  left: spacing.md,
  right: spacing.md,
  background: vars.background.surface,
  border: '1.5px solid color-mix(in srgb, var(--ach-co) 33%, transparent)',
  borderRadius: radii.xl,
  padding: '12px 14px',
  display: 'flex',
  alignItems: 'center',
  gap: 11,
  zIndex: 100,
  animation: `${achIn} .4s cubic-bezier(.34,1.56,.64,1)`,
  boxShadow: '0 8px 32px color-mix(in srgb, var(--ach-co) 27%, transparent)',
  '@media': {
    '(prefers-reduced-motion: reduce)': { animation: 'none' },
  },
})

export const iconCircle = style({
  width: 40,
  height: 40,
  borderRadius: 11,
  background: 'color-mix(in srgb, var(--ach-co) 9%, transparent)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 20,
  flexShrink: 0,
})

export const eyebrow = style({
  fontFamily: vars.font.mono,
  fontSize: fontSize['2xs'],
  fontWeight: fontWeight.bold,
  color: 'var(--ach-co)',
  letterSpacing: letterSpacing.looser,
  textTransform: 'uppercase',
  marginBottom: 2,
})

export const xpBadge = style({
  fontSize: fontSize.base,
  fontWeight: fontWeight.black,
  color: 'var(--ach-co)',
  fontFamily: vars.font.mono,
  background: 'color-mix(in srgb, var(--ach-co) 9%, transparent)',
  borderRadius: 7,
  padding: '4px 9px',
})
