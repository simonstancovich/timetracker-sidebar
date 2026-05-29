import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import * as s from './Text.css'

export type TextSize = keyof typeof s.size
export type TextWeight = keyof typeof s.weight
export type TextColor = keyof typeof s.color
export type TextAlign = keyof typeof s.align
export type TextMaxWidth = keyof typeof s.maxWidth
export type TextTransform = keyof typeof s.transform
export type TextTracking = keyof typeof s.tracking
export type TextTag = 'p' | 'span' | 'label' | 'small' | 'div'

interface Props extends Omit<HTMLAttributes<HTMLElement>, 'style' | 'children'> {
  size?: TextSize
  weight?: TextWeight
  color?: TextColor
  align?: TextAlign
  maxWidth?: TextMaxWidth
  transform?: TextTransform
  tracking?: TextTracking
  italic?: boolean
  preLine?: boolean
  truncate?: boolean
  as?: TextTag
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
  preLine = false,
  truncate = false,
  as: Tag = 'p',
  className,
  children,
  ...rest
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
    preLine && s.preLine,
    truncate && s.truncate,
    className,
  )
  return <Tag {...rest} className={classes}>{children}</Tag>
}
