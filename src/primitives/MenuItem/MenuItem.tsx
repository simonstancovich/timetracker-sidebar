import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../lib/cx'
import * as s from './MenuItem.css'

interface Props
  extends Omit<HTMLAttributes<HTMLDivElement>, 'role' | 'aria-selected' | 'style' | 'children'> {
  highlighted?: boolean
  children: ReactNode
}

export const MenuItem = forwardRef<HTMLDivElement, Props>(function MenuItem(
  { highlighted = false, className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      role="option"
      aria-selected={highlighted}
      className={cx(s.root, highlighted && s.highlighted, className)}
      {...rest}
    >
      {children}
    </div>
  )
})
