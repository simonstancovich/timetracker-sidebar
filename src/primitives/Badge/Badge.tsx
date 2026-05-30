import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../lib/cx'
import * as s from './Badge.css'

export type BadgeTone = keyof typeof s.tone

interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'style' | 'children'> {
  tone: BadgeTone
  children: ReactNode
}

export const Badge = forwardRef<HTMLSpanElement, Props>(function Badge(
  { tone, className, children, ...rest },
  ref,
) {
  return (
    <span ref={ref} {...rest} className={cx(s.root, s.tone[tone], className)}>
      {children}
    </span>
  )
})
