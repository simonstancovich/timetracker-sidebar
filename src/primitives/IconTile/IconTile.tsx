import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'
import * as s from './IconTile.css'

export type IconTileSize = keyof typeof s.size

interface Props {
  size?: IconTileSize
  className?: string
  children: ReactNode
}

export function IconTile({ size = 'md', className, children }: Props) {
  const classes = cx(s.root, s.size[size], className)
  return <div className={classes}>{children}</div>
}
