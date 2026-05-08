import { cx } from '../../lib/cx'
import * as s from './StatusDot.css'

export type StatusDotSize = keyof typeof s.size
export type StatusDotColor = keyof typeof s.color

interface Props {
  color: StatusDotColor
  size?: StatusDotSize
  // Adds a same-hue halo; used to draw attention to "live" states.
  glow?: boolean
  // Pulsing fade — typically paired with `glow` for running indicators.
  pulse?: boolean
  className?: string
}

export function StatusDot({ color, size = 'sm', glow = false, pulse = false, className }: Props) {
  const classes = cx(
    s.root,
    s.size[size],
    s.color[color],
    glow && s.glow[color],
    pulse && s.pulseClass,
    className,
  )
  return <span aria-hidden className={classes} />
}
