import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import * as s from './Pill.css'

export type PillHighlight = keyof typeof s.highlight

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'style'> {
  // When set, paints a tinted bg + border in that hue; otherwise the pill is
  // transparent with a soft border.
  highlight?: PillHighlight
  type?: 'button' | 'submit' | 'reset'
  children: ReactNode
}

export function Pill({ highlight, type = 'button', className, children, ...rest }: Props) {
  const classes = cx(s.root, highlight && s.highlight[highlight], className)
  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  )
}
