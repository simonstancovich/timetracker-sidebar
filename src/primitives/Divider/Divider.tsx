import { forwardRef, type HTMLAttributes } from 'react'
import { cx } from '../../lib/cx'
import * as s from './Divider.css'

export type DividerTone = keyof typeof s.tone

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'children'> {
  tone?: DividerTone
  grow?: boolean
}

export const Divider = forwardRef<HTMLDivElement, Props>(function Divider(
  { tone = 'soft', grow = false, className, 'aria-hidden': ariaHidden = true, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      {...rest}
      aria-hidden={ariaHidden}
      className={cx(s.root, s.tone[tone], grow && s.grow, className)}
    />
  )
})
