import { style, styleVariants } from '@vanilla-extract/css'
import { vars, fontSize, fontWeight, spacing } from '../theme'

export const root = style({
  height: '100vh',
  width: '100vw',
  background: vars.background.page,
  display: 'flex',
  alignItems: 'stretch',
  gap: 0,
  padding: 0,
  fontFamily: vars.font.body,
  borderBottom: `1px solid color-mix(in srgb, ${vars.border.soft} 35%, transparent)`,
  position: 'relative',
  overflow: 'hidden',
})

export const leftPane = style({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  gap: spacing.sm,
  padding: `0 ${spacing.sm}px`,
  position: 'relative',
  overflow: 'hidden',
  transition: 'background 200ms ease-out',
})

export const leftBg = styleVariants({
  running: { background: vars.background.page },
  pausedWithTime: { background: vars.background.urgent },
  pausedNoTime: { background: vars.background.danger },
})

export const playBtnRunning = style({ background: vars.typography.pink })

export const clockGroup = style({
  display: 'flex',
  alignItems: 'center',
  gap: spacing.xs,
  zIndex: 1,
})

export const clockText = style({
  letterSpacing: 0.1,
  minWidth: 48,
})

export const estimateOverlay = style({
  whiteSpace: 'nowrap',
  flexShrink: 0,
})

export const middleZone = style({
  flex: 1,
  minWidth: 0,
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  gap: spacing.sm,
})

export const marqueeZ = style({ zIndex: 1 })

export const marqueeTrack = style({
  fontSize: fontSize.xs,
  fontWeight: fontWeight.black,
  letterSpacing: 1.4,
  color: vars.typography.onAccent,
  fontFamily: vars.font.mono,
})

export const taskInfo = style({
  display: 'flex',
  alignItems: 'center',
  gap: spacing.xs,
  flexShrink: 0,
  maxWidth: '45%',
  minWidth: 0,
})

export const coName = style({
  letterSpacing: -0.2,
  flexShrink: 0,
  lineHeight: 1,
})

export const prName = style({
  letterSpacing: 1.4,
})

export const funMsg = style({
  flex: 1,
  minWidth: 0,
  letterSpacing: -0.1,
})

export const rightPane = style({
  display: 'flex',
  alignItems: 'center',
  gap: spacing.md,
  flexShrink: 0,
  padding: `0 ${spacing.md}px`,
  background: vars.background.page,
})

export const weekDots = style({
  display: 'flex',
  alignItems: 'center',
  gap: 3,
})

export const xpGroup = style({
  display: 'inline-flex',
  alignItems: 'baseline',
  gap: 3,
  position: 'relative',
})

export const ringHours = style({
  lineHeight: 1,
})

export const streakGroup = style({
  display: 'inline-flex',
  alignItems: 'baseline',
  gap: 3,
  color: vars.typography.pink,
})

export const petBtn = style({
  selectors: {
    '&&': {
      padding: 0,
      borderRadius: 4,
      background: 'transparent',
      border: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      lineHeight: 0,
      cursor: 'pointer',
    },
    '&&:hover': {
      transform: 'translateY(-1px)',
    },
    '&&:active': {
      transform: 'scale(0.95)',
    },
  },
})
