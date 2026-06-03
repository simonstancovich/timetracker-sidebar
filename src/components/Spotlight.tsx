import type { SyntheticEvent } from "react";
import * as prim from "../primitives";
import * as s from "./Spotlight.css";

export interface HoleRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

interface Props {
  hole: HoleRect;
  readOnly?: boolean;
  onDismiss: (e: SyntheticEvent) => void;
}

export function Spotlight({ hole, readOnly = false, onDismiss }: Props) {
  const { top, left, right, bottom, width, height } = hole;
  const maskPanels = [
    { top: 0, left: 0, right: 0, height: top },
    { top, left: 0, width: left, height },
    { top, left: right, right: 0, height },
    { top: bottom, left: 0, right: 0, bottom: 0 },
  ];

  return (
    <>
      {maskPanels.map((pos, i) => (
        <prim.OverlayRect
          key={i}
          className={s.mask}
          onClick={onDismiss}
          onMouseDown={onDismiss}
          {...pos}
        />
      ))}

      {readOnly && (
        <prim.OverlayRect
          className={s.block}
          top={top}
          left={left}
          width={width}
          height={height}
          onClick={onDismiss}
          onMouseDown={onDismiss}
        />
      )}

      <prim.OverlayRect
        className={s.ring}
        top={top}
        left={left}
        width={width}
        height={height}
      />
    </>
  );
}
