import { forwardRef, type ReactNode } from 'react'
import { cx } from '../../lib/cx'
import * as s from './Stack.css'

export type StackGap = keyof typeof s.gap
export type StackPadding = keyof typeof s.padding
export type StackBackground = keyof typeof s.background
export type StackBorder = keyof typeof s.border
export type StackBorderColor = keyof typeof s.borderColor
export type StackBorderStyle = keyof typeof s.borderStyle
export type StackBorderRadius = keyof typeof s.borderRadius
export type StackPosition = keyof typeof s.position

interface Props {
  direction?: keyof typeof s.direction
  align?: keyof typeof s.align
  justify?: keyof typeof s.justify
  gap?: StackGap
  padding?: StackPadding
  paddingX?: StackPadding
  paddingY?: StackPadding
  paddingTop?: StackPadding
  paddingRight?: StackPadding
  paddingBottom?: StackPadding
  paddingLeft?: StackPadding
  background?: StackBackground
  border?: StackBorder
  borderColor?: StackBorderColor
  borderStyle?: StackBorderStyle
  borderRadius?: StackBorderRadius
  position?: StackPosition
  top?: StackPadding
  right?: StackPadding
  bottom?: StackPadding
  left?: StackPadding
  fullWidth?: boolean
  fullHeight?: boolean
  // When the Stack is itself a child of a flex row, `shrink={false}` holds its
  // intrinsic width against siblings that want to grow.
  shrink?: boolean
  // Required on a flex-item Stack whose child wants to truncate — sets
  // `min-width: 0` so the item can shrink below its content width.
  minWidth0?: boolean
  wrap?: boolean
  className?: string
  children: ReactNode
}

export const Stack = forwardRef<HTMLDivElement, Props>(function Stack(
  {
    direction = 'column',
    align = 'stretch',
    justify = 'start',
    gap = 'none',
    padding = 'none',
    paddingX,
    paddingY,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    background,
    border,
    borderColor,
    borderStyle,
    borderRadius,
    position,
    top,
    right,
    bottom,
    left,
    fullWidth = false,
    fullHeight = false,
    shrink = true,
    minWidth0 = false,
    wrap = false,
    className,
    children,
  },
  ref,
) {
  const classes = cx(
    s.root,
    s.direction[direction],
    s.align[align],
    s.justify[justify],
    s.gap[gap],
    s.padding[padding],
    paddingX && s.paddingX[paddingX],
    paddingY && s.paddingY[paddingY],
    paddingTop && s.paddingTop[paddingTop],
    paddingRight && s.paddingRight[paddingRight],
    paddingBottom && s.paddingBottom[paddingBottom],
    paddingLeft && s.paddingLeft[paddingLeft],
    background && s.background[background],
    border && s.border[border],
    borderColor && s.borderColor[borderColor],
    borderStyle && s.borderStyle[borderStyle],
    borderRadius && s.borderRadius[borderRadius],
    position && s.position[position],
    top && s.top[top],
    right && s.right[right],
    bottom && s.bottom[bottom],
    left && s.left[left],
    fullWidth && s.fullWidth,
    fullHeight && s.fullHeight,
    !shrink && s.noShrink,
    minWidth0 && s.minWidth0,
    wrap && s.wrap,
    className,
  )
  return (
    <div ref={ref} className={classes}>
      {children}
    </div>
  )
})
