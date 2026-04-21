import type { HTMLAttributes, ReactNode } from 'react'
import * as s from './TabList.css'

// `role` and `style` are owned by the primitive. aria-label and other HTML
// attrs pass through — callers should label the tablist for screen readers.
interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'role' | 'style'> {
  children: ReactNode
}

export function TabList({ className, children, ...rest }: Props) {
  const classes = [s.root, className].filter(Boolean).join(' ')
  return (
    <div role="tablist" className={classes} {...rest}>
      {children}
    </div>
  )
}
