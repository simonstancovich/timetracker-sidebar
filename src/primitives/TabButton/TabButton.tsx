import type { ButtonHTMLAttributes, ReactNode } from 'react'
import * as s from './TabButton.css'

// `style`, `type`, `role`, and `aria-selected` are owned by the primitive — a
// TabButton is always a type="button" role="tab", and `selected` is the prop
// that drives aria-selected. Everything else (onClick, data-*, aria-label,
// disabled, className) passes through.
interface Props extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'type' | 'style' | 'role' | 'aria-selected'
> {
  selected: boolean
  children: ReactNode
}

export function TabButton({ selected, className, children, ...rest }: Props) {
  const classes = [
    s.root,
    selected ? s.state.selected : s.state.unselected,
    className,
  ].filter(Boolean).join(' ')
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      className={classes}
      {...rest}
    >
      {children}
    </button>
  )
}
