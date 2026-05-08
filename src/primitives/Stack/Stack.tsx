import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'
import * as s from './Stack.css'

export type StackGap = keyof typeof s.gap
export type StackPadding = keyof typeof s.padding

interface Props {
  direction?: keyof typeof s.direction
  align?: keyof typeof s.align
  justify?: keyof typeof s.justify
  gap?: StackGap
  padding?: StackPadding
  fullHeight?: boolean
  // When the Stack is itself a child of a flex row, `shrink={false}` holds its
  // intrinsic width against siblings that want to grow.
  shrink?: boolean
  className?: string
  children: ReactNode
}

export function Stack({
  direction = 'column',
  align = 'stretch',
  justify = 'start',
  gap = 'none',
  padding = 'none',
  fullHeight = false,
  shrink = true,
  className,
  children,
}: Props) {
  const classes = cx(
    s.root,
    s.direction[direction],
    s.align[align],
    s.justify[justify],
    s.gap[gap],
    s.padding[padding],
    fullHeight && s.fullHeight,
    !shrink && s.noShrink,
    className,
  )
  return <div className={classes}>{children}</div>
}
