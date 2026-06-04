import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../lib/cx";
import { fadeUp } from "../styles/intro.css";
import * as s from "./TourTooltip.css";

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "style"> {
  top: number;
  left: number;
  maxWidth: number;
  children: ReactNode;
}

export const TourTooltip = forwardRef<HTMLDivElement, Props>(function TourTooltip(
  { top, left, maxWidth, className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx(s.root, fadeUp, className)}
      style={{ top, left, maxWidth }}
      {...rest}
    >
      {children}
    </div>
  );
});
