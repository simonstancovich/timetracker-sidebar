import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../lib/cx'
import * as s from './EmptyMessage.css'

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'children'> {
  children: ReactNode
}

export const EmptyMessage = forwardRef<HTMLDivElement, Props>(function EmptyMessage(
  { className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} {...rest} className={cx(s.root, className)}>
      {children}
    </div>
  )
})
