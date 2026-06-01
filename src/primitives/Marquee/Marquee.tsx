import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../lib/cx'
import * as s from './Marquee.css'

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'children'> {
  paused?: boolean
  trackClassName?: string
  children: ReactNode
}

export const Marquee = forwardRef<HTMLDivElement, Props>(function Marquee(
  { paused = false, trackClassName, className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} {...rest} className={cx(s.root, className)}>
      <div className={cx(s.track, paused && s.paused, trackClassName)}>
        {children}
        {children}
      </div>
    </div>
  )
})
