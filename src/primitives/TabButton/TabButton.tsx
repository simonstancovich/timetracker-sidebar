import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "../../lib/cx";
import * as s from "./TabButton.css";

interface Props extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "style" | "role" | "aria-selected"
> {
  selected: boolean;
  children: ReactNode;
}

export function TabButton({ selected, className, children, ...rest }: Props) {
  const classes = cx(
    s.root,
    selected ? s.state.selected : s.state.unselected,
    className,
  );
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      className={classes}
      {...rest}
    >
      {children}
    </button>
  );
}
