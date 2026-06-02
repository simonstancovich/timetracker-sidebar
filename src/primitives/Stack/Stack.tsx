import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
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
export type StackTag = 'div' | 'section' | 'nav' | 'header' | 'footer' | 'main' | 'aside' | 'ul' | 'ol' | 'li' | 'span' | 'p'

interface Props extends Omit<HTMLAttributes<HTMLElement>, 'style' | 'children'> {
  direction?: keyof typeof s.direction
  align?: keyof typeof s.align
  justify?: keyof typeof s.justify
  gap?: StackGap
  rowGap?: StackGap
  columnGap?: StackGap
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
  viewportHeight?: boolean
  noShrink?: boolean
  flex1?: boolean
  minWidth0?: boolean
  minHeight0?: boolean
  overflowY?: keyof typeof s.overflowY
  wrap?: boolean
  inline?: boolean
  as?: StackTag
  children: ReactNode
}

export const Stack = forwardRef<HTMLElement, Props>(function Stack(
  {
    direction = 'column',
    align = 'stretch',
    justify = 'start',
    gap = 'none',
    rowGap,
    columnGap,
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
    viewportHeight = false,
    noShrink = false,
    flex1 = false,
    minWidth0 = false,
    minHeight0 = false,
    overflowY,
    wrap = false,
    inline = false,
    as: Tag = 'div',
    className,
    children,
    ...rest
  },
  ref,
) {
  const classes = cx(
    s.root,
    s.direction[direction],
    s.align[align],
    s.justify[justify],
    s.gap[gap],
    rowGap && s.rowGap[rowGap],
    columnGap && s.columnGap[columnGap],
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
    viewportHeight && s.viewportHeight,
    noShrink && s.noShrink,
    flex1 && s.flex1,
    minWidth0 && s.minWidth0,
    minHeight0 && s.minHeight0,
    overflowY && s.overflowY[overflowY],
    wrap && s.wrap,
    inline && s.inline,
    className,
  )
  return (
    <Tag ref={ref as never} {...rest} className={classes}>
      {children}
    </Tag>
  )
})
