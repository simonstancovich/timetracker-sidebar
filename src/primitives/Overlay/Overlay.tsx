import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../lib/cx";
import * as s from "./Overlay.css";

export type OverlayZIndex = keyof typeof s.zIndex;
export type OverlayTone = keyof typeof s.tone;

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "style"> {
  zIndex?: OverlayZIndex;
  tone?: OverlayTone;
  children?: ReactNode;
}

export const Overlay = forwardRef<HTMLDivElement, Props>(function Overlay(
  { zIndex = "modal", tone = "none", className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx(s.layer, s.root, s.zIndex[zIndex], s.tone[tone], className)}
      {...rest}
    >
      {children}
    </div>
  );
});
