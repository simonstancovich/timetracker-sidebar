import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../lib/cx'
import * as s from './IconTile.css'

export type IconTileSize = keyof typeof s.size

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'children'> {
  size?: IconTileSize
  children: ReactNode
}

export const IconTile = forwardRef<HTMLDivElement, Props>(function IconTile(
  { size = 'md', className, children, 'aria-hidden': ariaHidden = true, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      {...rest}
      aria-hidden={ariaHidden}
      className={cx(s.root, s.size[size], className)}
    >
      {children}
    </div>
  )
})
