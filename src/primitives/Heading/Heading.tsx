import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../lib/cx'
import * as s from './Heading.css'

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6
export type HeadingColor = keyof typeof s.color

const TAGS = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
  6: 'h6',
} as const

interface Props extends Omit<HTMLAttributes<HTMLHeadingElement>, 'style' | 'children'> {
  level?: HeadingLevel
  size?: HeadingLevel
  color?: HeadingColor
  children: ReactNode
}

export const Heading = forwardRef<HTMLHeadingElement, Props>(function Heading(
  { level = 1, size, color = 'primary', className, children, ...rest },
  ref,
) {
  const Tag = TAGS[level]
  const visualLevel = size ?? level
  return (
    <Tag
      ref={ref}
      {...rest}
      className={cx(s.root, s.level[visualLevel], s.color[color], className)}
    >
      {children}
    </Tag>
  )
})
