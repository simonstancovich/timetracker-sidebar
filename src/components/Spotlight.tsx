import type { CSSProperties, SyntheticEvent } from "react";
import { vars } from "../theme";

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

// A coachmark cutout: four masks dim everything except the hole, an optional
// transparent layer blocks interaction with read-only targets, and a pulsing
// ring frames the highlighted element. Positions are runtime pixel geometry,
// so they stay inline; shared static styling lives in the .intro-* classes.
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
          className="overlay-layer intro-mask"
          style={pos}
          onClick={onDismiss}
          onMouseDown={onDismiss}
        />
      ))}

      {readOnly && (
        <div
          className="overlay-layer intro-block"
          style={{ top, left, width, height }}
          onClick={onDismiss}
          onMouseDown={onDismiss}
        />
      )}

      <div
        className="overlay-layer intro-ring"
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
