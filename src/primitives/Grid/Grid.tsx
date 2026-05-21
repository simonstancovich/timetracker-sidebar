import type { ReactNode } from "react";
import { cx } from "../../lib/cx";
import * as s from "./Grid.css";

export type GridColumns = keyof typeof s.columns;
export type GridGap = keyof typeof s.gap;
export type GridPadding = keyof typeof s.paddingX;
export type GridAlign = keyof typeof s.align;

interface Props {
  columns: GridColumns;
  gap?: GridGap;
  paddingX?: GridPadding;
  paddingY?: GridPadding;
  align?: GridAlign;
  borderY?: boolean;
  className?: string;
  children: ReactNode;
}

export function Grid({
  columns,
  gap = "none",
  paddingX,
  paddingY,
  align,
  borderY = false,
  className,
  children,
}: Props) {
  const classes = cx(
    s.root,
    s.columns[columns],
    s.gap[gap],
    paddingX && s.paddingX[paddingX],
    paddingY && s.paddingY[paddingY],
    align && s.align[align],
    borderY && s.borderY,
    className,
  );
  return <div className={classes}>{children}</div>;
}
