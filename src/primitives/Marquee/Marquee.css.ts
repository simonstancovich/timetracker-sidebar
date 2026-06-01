import { keyframes, style } from '@vanilla-extract/css'

const marqueeX = keyframes({
  '0%': { transform: 'translateX(0)' },
  '100%': { transform: 'translateX(-50%)' },
})

export const root = style({
  display: 'flex',
  overflow: 'hidden',
  minWidth: 0,
  flex: 1,
  maskImage:
    'linear-gradient(to right, transparent 0, black 16px, black calc(100% - 16px), transparent 100%)',
})

export const track = style({
  display: 'inline-block',
  whiteSpace: 'nowrap',
  animation: `${marqueeX} 80s linear infinite`,
  paddingRight: 0,
  '@media': {
    '(prefers-reduced-motion: reduce)': { animation: 'none' },
  },
})

export const paused = style({
  animationPlayState: 'paused',
})
