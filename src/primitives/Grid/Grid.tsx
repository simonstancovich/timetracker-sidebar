import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../lib/cx'
import * as s from './Grid.css'

export type GridColumns = keyof typeof s.columns
export type GridGap = keyof typeof s.gap
export type GridPadding = keyof typeof s.paddingX
export type GridAlign = keyof typeof s.align

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'children'> {
  columns: GridColumns
  gap?: GridGap
  paddingX?: GridPadding
  paddingY?: GridPadding
  align?: GridAlign
  borderY?: boolean
  children: ReactNode
}

export const Grid = forwardRef<HTMLDivElement, Props>(function Grid(
  {
    columns,
    gap = 'none',
    paddingX,
    paddingY,
    align,
    borderY = false,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <div
      ref={ref}
      {...rest}
      className={cx(
        s.root,
        s.columns[columns],
        s.gap[gap],
        paddingX && s.paddingX[paddingX],
        paddingY && s.paddingY[paddingY],
        align && s.align[align],
        borderY && s.borderY,
        className,
      )}
    >
      {children}
    </div>
  )
})
