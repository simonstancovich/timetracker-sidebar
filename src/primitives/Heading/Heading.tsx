import type { ReactNode } from 'react'
import * as s from './Heading.css'

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6
export type HeadingColor = keyof typeof s.color

interface Props {
  level?: HeadingLevel
  color?: HeadingColor
  className?: string
  children: ReactNode
}

export function Heading({ level = 1, color = 'primary', className, children }: Props) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  const classes = [s.root, s.level[level], s.color[color], className].filter(Boolean).join(' ')
  return <Tag className={classes}>{children}</Tag>
}
