import { forwardRef, type HTMLAttributes } from 'react'
import { cx } from '../../lib/cx'
import * as s from './StatusDot.css'

export type StatusDotSize = keyof typeof s.size
export type StatusDotColor = keyof typeof s.color

interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'style' | 'children'> {
  color: StatusDotColor
  size?: StatusDotSize
  glow?: boolean
  pulse?: boolean
  opacity?: number
}

export const StatusDot = forwardRef<HTMLSpanElement, Props>(function StatusDot(
  { color, size = 'sm', glow = false, pulse = false, opacity, className, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      aria-hidden
      {...rest}
      className={cx(
        s.root,
        s.size[size],
        s.color[color],
        glow && s.glow[color],
        pulse && s.pulseClass,
        className,
      )}
      style={opacity != null ? { opacity } : undefined}
    />
  )
})
