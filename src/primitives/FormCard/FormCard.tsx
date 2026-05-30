import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { Card } from '../Card/Card'
import * as s from './FormCard.css'

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'children'> {
  accent?: boolean
  children: ReactNode
}

export const FormCard = forwardRef<HTMLDivElement, Props>(function FormCard(
  { accent = false, className, children, ...rest },
  ref,
) {
  return (
    <Card
      ref={ref}
      {...rest}
      tone={accent ? 'accent' : 'default'}
      pad="md"
      className={cx(s.stack, className)}
    >
      {children}
    </Card>
  )
})
