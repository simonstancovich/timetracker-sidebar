import type { ReactNode } from "react";
import { cx } from "../../lib/cx";
import * as s from "./MonoText.css";

export type MonoTextSize = keyof typeof s.size;
export type MonoTextWeight = keyof typeof s.weight;
export type MonoTextColor = keyof typeof s.color;
export type MonoTextTracking = keyof typeof s.tracking;
export type MonoTextTransform = keyof typeof s.transform;
export type MonoTextAlign = keyof typeof s.align;

interface Props {
  size?: MonoTextSize;
  weight?: MonoTextWeight;
  color?: MonoTextColor;
  tracking?: MonoTextTracking;
  transform?: MonoTextTransform;
  align?: MonoTextAlign;
  tabular?: boolean;
  className?: string;
  children: ReactNode;
}

export function MonoText({
  size = "base",
  weight = "bold",
  color = "primary",
  tracking = "normal",
  transform,
  align,
  tabular = false,
  className,
  children,
}: Props) {
  const classes = cx(
    s.root,
    s.size[size],
    s.weight[weight],
    s.color[color],
    s.tracking[tracking],
    transform && s.transform[transform],
    align && s.align[align],
    tabular && s.tabular,
    className,
  );
  return <span className={classes}>{children}</span>;
}
