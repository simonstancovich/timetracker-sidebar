import { forwardRef, type LabelHTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../lib/cx'
import * as s from './FieldLabel.css'

export type FieldLabelTone = keyof typeof s.tone

interface Props extends Omit<LabelHTMLAttributes<HTMLLabelElement>, 'style' | 'children'> {
  tone?: FieldLabelTone
  children: ReactNode
}

export const FieldLabel = forwardRef<HTMLLabelElement, Props>(function FieldLabel(
  { tone = 'faint', className, children, ...rest },
  ref,
) {
  return (
    <label ref={ref} {...rest} className={cx(s.root, s.tone[tone], className)}>
      {children}
    </label>
  )
})
