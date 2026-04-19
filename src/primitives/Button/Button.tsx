import type { ButtonHTMLAttributes, ReactNode } from 'react'
import * as s from './Button.css'

export type ButtonVariant = keyof typeof s.variant
export type ButtonSize = keyof typeof s.size

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: ButtonVariant
  size?: ButtonSize
  type?: 'button' | 'submit' | 'reset'
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  className,
  children,
  ...rest
}: Props) {
  const classes = [s.root, s.variant[variant], s.size[size], className].filter(Boolean).join(' ')
  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  )
}
