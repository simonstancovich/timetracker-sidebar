import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'
import * as s from './Text.css'

export type TextSize = keyof typeof s.size
export type TextWeight = keyof typeof s.weight
export type TextColor = keyof typeof s.color
export type TextAlign = keyof typeof s.align
export type TextMaxWidth = keyof typeof s.maxWidth
export type TextTransform = keyof typeof s.transform
export type TextTracking = keyof typeof s.tracking

interface Props {
  size?: TextSize
  weight?: TextWeight
  color?: TextColor
  align?: TextAlign
  maxWidth?: TextMaxWidth
  transform?: TextTransform
  tracking?: TextTracking
  italic?: boolean
  // Single-line ellipsis when overflowing.
  truncate?: boolean
  // `true` renders as an inline <span> (e.g. for inline labels inside a flex
  // row); default is a block <p>.
  inline?: boolean
  className?: string
  children: ReactNode
}

export function Text({
  size = 'base',
  weight = 'normal',
  color = 'primary',
  align = 'left',
  maxWidth,
  transform,
  tracking,
  italic = false,
  truncate = false,
  inline = false,
  className,
  children,
}: Props) {
  const classes = cx(
    s.root,
    s.size[size],
    s.weight[weight],
    s.color[color],
    s.align[align],
    maxWidth && s.maxWidth[maxWidth],
    transform && s.transform[transform],
    tracking && s.tracking[tracking],
    italic && s.italic,
    truncate && s.truncate,
    className,
  )
  const Tag = inline ? 'span' : 'p'
  return <Tag className={classes}>{children}</Tag>
}
