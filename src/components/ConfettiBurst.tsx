import { useMemo } from "react";
import * as prim from "../primitives";
import { vars } from "../theme";
import * as s from "./ConfettiBurst.css";

interface Props {
  show: boolean;
}

interface Piece {
  id: number;
  color: string;
  targetX: number;
  targetY: number;
  rotation: number;
  delayMs: number;
}

const PIECE_COUNT = 22;

function buildPieces(): Piece[] {
  const palette = [
    vars.typography.accent,
    vars.typography.pink,
    vars.typography.green,
    "#e8c060",
  ];
  return Array.from({ length: PIECE_COUNT }, (_, i) => {
    const angle = (i / PIECE_COUNT) * Math.PI * 2;
    const dist = 90 + Math.random() * 90;
    return {
      id: i,
      color: palette[i % palette.length] as string,
      targetX: Math.cos(angle) * dist,
      targetY: Math.sin(angle) * dist - 30,
      rotation: (Math.random() - 0.5) * 720,
      delayMs: Math.random() * 120,
    };
  });
}

export function ConfettiBurst({ show }: Props) {
  const pieces = useMemo(() => (show ? buildPieces() : []), [show]);
  if (!show) return null;
  return (
    <prim.Stack position="absolute" className={s.anchor} aria-hidden>
      {pieces.map((p) => (
        <prim.ConfettiPiece
          key={p.id}
          color={p.color}
          targetX={p.targetX}
          targetY={p.targetY}
          rotation={p.rotation}
          delayMs={p.delayMs}
        />
      ))}
    </prim.Stack>
  );
}
