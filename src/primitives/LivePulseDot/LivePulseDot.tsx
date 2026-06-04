import { forwardRef, type HTMLAttributes } from "react";
import { cx } from "../../lib/cx";
import { livePulseDot } from "../../styles/celebration.css";

interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, "style" | "children"> {
  size: number;
  ringColor: string;
  background: string;
}

export const LivePulseDot = forwardRef<HTMLSpanElement, Props>(function LivePulseDot(
  { size, ringColor, background, className, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      {...rest}
      className={cx(livePulseDot, className)}
      style={
        {
          width: size,
          height: size,
          background,
          "--live-pulse-ring": ringColor,
        } as { [k: string]: string | number }
      }
    />
  );
});
