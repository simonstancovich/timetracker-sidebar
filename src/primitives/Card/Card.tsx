import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../lib/cx'
import * as s from './Card.css'

export type CardTone = keyof typeof s.tone
export type CardRadius = keyof typeof s.radius
export type CardPad = keyof typeof s.pad

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'children'> {
  tone?: CardTone
  radius?: CardRadius
  pad?: CardPad
  children: ReactNode
}

export const Card = forwardRef<HTMLDivElement, Props>(function Card(
  { tone = 'default', radius = 'lg', pad = 'md', className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      {...rest}
      className={cx(s.root, s.tone[tone], s.radius[radius], s.pad[pad], className)}
    >
      {children}
    </div>
  )
})
