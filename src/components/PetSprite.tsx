import { useEffect, useMemo, useState } from "react";
import { cx } from "../lib/cx";
import {
  getCreature,
  parseSprite,
  SPRITE_SIZE,
  type PetAnimKind,
} from "../sprites/petSprites";
import * as s from "./PetSprite.css";

export type PetSize = keyof typeof s.sizeVariant;

interface Props {
  creature: string;
  anim?: PetAnimKind;
  size?: PetSize;
  sad?: boolean;
  paused?: boolean;
  frameIndex?: number;
  title?: string;
}

export function PetSprite({
  creature,
  anim = "idle",
  size = "xs",
  sad = false,
  paused = false,
  frameIndex: frameOverride,
  title,
}: Props) {
  const creatureData = getCreature(creature);
  const animation =
    creatureData?.animations[anim] ?? creatureData?.animations.idle;
  const frames = animation?.frames ?? [];
  const fps = animation?.fps ?? 1;

  const [tickedIndex, setTickedIndex] = useState(0);

  useEffect(() => {
    setTickedIndex(0);
  }, [creature, anim]);

  useEffect(() => {
    if (frameOverride !== undefined) return;
    if (paused || frames.length <= 1) return;
    const interval = 1000 / fps;
    const id = window.setInterval(() => {
      setTickedIndex((i) => (i + 1) % frames.length);
    }, interval);
    return () => window.clearInterval(id);
  }, [fps, frames.length, paused, frameOverride]);

  const activeIndex = frameOverride ?? tickedIndex;

  const rects = useMemo(() => {
    const frame = frames[activeIndex] ?? frames[0];
    return frame ? parseSprite(frame) : [];
  }, [frames, activeIndex]);

  if (!frames.length) return null;

  return (
    <span
      className={cx(s.root, s.sizeVariant[size], sad && s.sadOverlay)}
      title={title}
    >
      <svg
        className={s.svg}
        viewBox={`0 0 ${SPRITE_SIZE} ${SPRITE_SIZE}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
      >
        {rects.map((r, i) => (
          <rect key={i} x={r.x} y={r.y} width={1} height={1} fill={r.color} />
        ))}
      </svg>
    </span>
  );
}
