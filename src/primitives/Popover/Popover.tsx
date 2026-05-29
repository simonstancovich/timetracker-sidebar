import { forwardRef, type HTMLAttributes } from 'react'
import { cx } from '../../lib/cx'
import * as s from './Popover.css'

type Props = Omit<HTMLAttributes<HTMLDivElement>, 'style'>

export const Popover = forwardRef<HTMLDivElement, Props>(function Popover(
  { className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} {...rest} className={cx(s.root, className)}>
      {children}
    </div>
  )
})
