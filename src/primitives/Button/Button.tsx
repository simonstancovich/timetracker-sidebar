import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../lib/cx'
import * as s from './Button.css'

export type ButtonVariant = keyof typeof s.variant
export type ButtonSize = keyof typeof s.size
export type ButtonShape = keyof typeof s.shape

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'style'> {
  variant?: ButtonVariant
  size?: ButtonSize
  shape?: ButtonShape
  mono?: boolean
  grow?: boolean
  type?: 'button' | 'submit' | 'reset'
  children: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  {
    variant = 'primary',
    size = 'md',
    shape = 'default',
    mono = false,
    grow = false,
    type = 'button',
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        s.root,
        s.variant[variant],
        s.size[size],
        s.shape[shape],
        mono && s.mono,
        grow && s.grow,
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
})
