import { forwardRef, type HTMLAttributes } from 'react'
import { cx } from '../../lib/cx'
import * as s from './ProgressFill.css'

export type ProgressFillTone = keyof typeof s.tone

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'children'> {
  progress: number
  tone?: ProgressFillTone
}

export const ProgressFill = forwardRef<HTMLDivElement, Props>(function ProgressFill(
  { progress, tone = 'accent', className, ...rest },
  ref,
) {
  const clamped = Math.max(0, Math.min(1, progress))
  return (
    <div
      ref={ref}
      {...rest}
      aria-hidden
      className={cx(s.root, s.tone[tone], className)}
      style={{ width: `${clamped * 100}%` }}
    />
  )
})
