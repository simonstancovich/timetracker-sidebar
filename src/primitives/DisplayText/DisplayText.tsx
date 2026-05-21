import type { ReactNode } from "react";
import { cx } from "../../lib/cx";
import * as s from "./DisplayText.css";

export type DisplayTextSize = keyof typeof s.size;
export type DisplayTextWeight = keyof typeof s.weight;
export type DisplayTextColor = keyof typeof s.color;
export type DisplayTextAlign = keyof typeof s.align;
export type DisplayTextTracking = keyof typeof s.tracking;
export type DisplayTextMaxWidth = keyof typeof s.maxWidth;
export type DisplayTextLeading = keyof typeof s.leading;

interface Props {
  size?: DisplayTextSize;
  weight?: DisplayTextWeight;
  color?: DisplayTextColor;
  align?: DisplayTextAlign;
  tracking?: DisplayTextTracking;
  leading?: DisplayTextLeading;
  maxWidth?: DisplayTextMaxWidth;
  italic?: boolean;
  tabular?: boolean;
  truncate?: boolean;
  className?: string;
  children: ReactNode;
}

export function DisplayText({
  size = "2xl",
  weight = "normal",
  color = "primary",
  align = "left",
  tracking = "normal",
  leading = "tight",
  maxWidth,
  italic = false,
  tabular = false,
  truncate = false,
  className,
  children,
}: Props) {
  const classes = cx(
    s.root,
    s.size[size],
    s.weight[weight],
    s.color[color],
    s.align[align],
    s.tracking[tracking],
    s.leading[leading],
    maxWidth && s.maxWidth[maxWidth],
    italic && s.italic,
    tabular && s.tabular,
    truncate && s.truncate,
    className,
  );
  return <span className={classes}>{children}</span>;
}
