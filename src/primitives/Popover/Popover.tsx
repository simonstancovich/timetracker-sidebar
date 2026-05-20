import type { HTMLAttributes } from 'react'
import { cx } from '../../lib/cx'
import * as s from './Popover.css'

type Props = HTMLAttributes<HTMLDivElement>

export function Popover({ className, children, ...rest }: Props) {
  return (
    <div className={cx(s.root, className)} {...rest}>
      {children}
    </div>
  )
}
