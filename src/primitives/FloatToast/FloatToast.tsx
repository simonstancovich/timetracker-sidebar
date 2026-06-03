import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../lib/cx";
import * as s from "./FloatToast.css";

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "style" | "children"> {
  color: string;
  children: ReactNode;
}

export const FloatToast = forwardRef<HTMLDivElement, Props>(function FloatToast(
  { color, className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      {...rest}
      className={cx(s.root, className)}
      style={{ color, boxShadow: `0 4px 24px ${color}44` }}
    >
      {children}
    </div>
  );
});
