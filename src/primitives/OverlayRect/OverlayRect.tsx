import { forwardRef, type SyntheticEvent } from "react";
import { cx } from "../../lib/cx";
import { layer as overlayLayer } from "../Overlay/Overlay.css";

interface Props {
  top?: number | string;
  left?: number | string;
  right?: number | string;
  bottom?: number | string;
  width?: number | string;
  height?: number | string;
  className?: string;
  onClick?: (e: SyntheticEvent) => void;
  onMouseDown?: (e: SyntheticEvent) => void;
}

export const OverlayRect = forwardRef<HTMLDivElement, Props>(function OverlayRect(
  { top, left, right, bottom, width, height, className, onClick, onMouseDown },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx(overlayLayer, className)}
      style={{ top, left, right, bottom, width, height }}
      onClick={onClick}
      onMouseDown={onMouseDown}
    />
  );
});
