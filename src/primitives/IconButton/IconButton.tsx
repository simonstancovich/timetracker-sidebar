import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../lib/cx'
import * as s from './IconButton.css'

export type IconButtonVariant = keyof typeof s.variant
export type IconButtonSize = keyof typeof s.size
export type IconButtonShape = keyof typeof s.shape

interface Props
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'style' | 'aria-label'> {
  'aria-label': string
  variant?: IconButtonVariant
  size?: IconButtonSize
  shape?: IconButtonShape
  type?: 'button' | 'submit' | 'reset'
  badge?: ReactNode
  children: ReactNode
}

export const IconButton = forwardRef<HTMLButtonElement, Props>(function IconButton(
  { variant = 'soft', size = 'sm', shape = 'default', type = 'button', badge, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx(s.root, s.variant[variant], s.size[size], s.shape[shape], className)}
      {...rest}
    >
      {children}
      {badge && <span className={s.badge}>{badge}</span>}
    </button>
  )
})
