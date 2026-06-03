import type { CSSProperties, SyntheticEvent } from "react";
import { vars } from "../theme";
import { cx } from "../lib/cx";
import { layer as overlayLayer } from "../primitives/Overlay/Overlay.css";
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
  const maskPanels: CSSProperties[] = [
    { top: 0, left: 0, right: 0, height: top },
    { top, left: 0, width: left, height },
    { top, left: right, right: 0, height },
    { top: bottom, left: 0, right: 0, bottom: 0 },
  ];

  return (
    <>
      {maskPanels.map((pos, i) => (
        <div
          key={i}
          className={cx(overlayLayer, s.mask)}
          style={pos}
          onClick={onDismiss}
          onMouseDown={onDismiss}
        />
      ))}

      {readOnly && (
        <div
          className={cx(overlayLayer, s.block)}
          style={{ top, left, width, height }}
          onClick={onDismiss}
          onMouseDown={onDismiss}
        />
      )}

      <div
        className={cx(overlayLayer, s.ring)}
        style={{
          top,
          left,
          width,
          height,
          border: `2px solid ${vars.typography.accent}`,
          boxShadow: `0 0 0 4px color-mix(in srgb, ${vars.typography.accent} 20%, transparent), 0 0 22px color-mix(in srgb, ${vars.typography.accent} 40%, transparent)`,
        }}
      />
    </>
  );
}
