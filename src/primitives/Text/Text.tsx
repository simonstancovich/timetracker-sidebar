import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'
import * as s from './Text.css'

export type TextColor = keyof typeof s.color
export type TextAlign = keyof typeof s.align
export type TextMaxWidth = keyof typeof s.maxWidth

interface Props {
  color?: TextColor
  align?: TextAlign
  maxWidth?: TextMaxWidth
  className?: string
  children: ReactNode
}

export function Text({
  color = 'primary',
  align = 'left',
  maxWidth,
  className,
  children,
}: Props) {
  const classes = cx(
    s.root,
    s.color[color],
    s.align[align],
    maxWidth && s.maxWidth[maxWidth],
    className,
  )
  return <p className={classes}>{children}</p>
}
