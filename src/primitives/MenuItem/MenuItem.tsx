import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import * as s from './MenuItem.css'

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'role' | 'aria-selected'> {
  highlighted?: boolean
  children: ReactNode
}

export function MenuItem({
  highlighted = false,
  className,
  children,
  ...rest
}: Props) {
  return (
    <div
      role="option"
      aria-selected={highlighted}
      className={cx(s.root, highlighted && s.highlighted, className)}
      {...rest}
    >
      {children}
    </div>
  )
}
