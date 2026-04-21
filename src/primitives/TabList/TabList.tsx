import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import * as s from './TabList.css'

// `role` and `style` are owned by the primitive. aria-label and other HTML
// attrs pass through — callers should label the tablist for screen readers.
interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'role' | 'style'> {
  children: ReactNode
}

export function TabList({ className, children, ...rest }: Props) {
  const classes = cx(s.root, className)
  return (
    <div role="tablist" className={classes} {...rest}>
      {children}
    </div>
  )
}
