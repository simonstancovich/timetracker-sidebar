import type { ReactNode } from 'react'
import * as s from './IconTile.css'

export type IconTileSize = keyof typeof s.size

interface Props {
  size?: IconTileSize
  className?: string
  children: ReactNode
}

export function IconTile({ size = 'md', className, children }: Props) {
  const classes = [s.root, s.size[size], className].filter(Boolean).join(' ')
  return <div className={classes}>{children}</div>
}
