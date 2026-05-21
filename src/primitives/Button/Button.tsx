import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import * as s from './Button.css'

export type ButtonVariant = keyof typeof s.variant
export type ButtonSize = keyof typeof s.size
export type ButtonShape = keyof typeof s.shape

// `style` is omitted so callers can't bypass the token system with inline
// styles; `type` is narrowed to only the values that make sense on a button.
// Everything else — handlers, aria-*, data-*, disabled, form*, etc. — passes
// through as expected.
interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'style'> {
  variant?: ButtonVariant
  size?: ButtonSize
  shape?: ButtonShape
  mono?: boolean
  grow?: boolean
  type?: 'button' | 'submit' | 'reset'
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  shape = 'default',
  mono = false,
  grow = false,
  type = 'button',
  className,
  children,
  ...rest
}: Props) {
  const classes = cx(
    s.root,
    s.variant[variant],
    s.size[size],
    s.shape[shape],
    mono && s.mono,
    grow && s.grow,
    className,
  )
  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  )
}
