import { forwardRef, type HTMLAttributes } from "react";
import { cx } from "../../lib/cx";
import * as s from "./ConfettiPiece.css";

interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, "style" | "children"> {
  color: string;
  targetX: number;
  targetY: number;
  rotation: number;
  delayMs: number;
}

export const ConfettiPiece = forwardRef<HTMLSpanElement, Props>(function ConfettiPiece(
  { color, targetX, targetY, rotation, delayMs, className, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      {...rest}
      aria-hidden
      className={cx(s.root, className)}
      style={
        {
          background: color,
          "--cx": `${targetX}px`,
          "--cy": `${targetY}px`,
          "--cr": `${rotation}deg`,
          animationDelay: `${delayMs}ms`,
        } as { [k: string]: string }
      }
    />
  );
});
