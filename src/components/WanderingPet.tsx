import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cx } from "../lib/cx";
import * as prim from "../primitives";
import { PetSprite } from "./PetSprite";
import { getCreature } from "../sprites/petSprites";
import * as s from "./WanderingPet.css";

interface Props {
  petId: string;
  onCyclePet: () => void;
}

type Mode = "idle" | "walking" | "sleeping";

const FLOOR_Y = 50;
const X_MIN = 12;
const X_MAX = 88;
const X_RANGE = X_MAX - X_MIN;
const MIN_TRAVEL = 22;
const WALK_PCT_PER_SEC = 12;
const IDLE_MIN_MS = 3000;
const IDLE_MAX_MS = 7000;
const SLEEP_MIN_MS = 8000;
const SLEEP_MAX_MS = 16000;
const SLEEP_CHANCE = 0.25;

function randomX(): number {
  return X_MIN + Math.random() * X_RANGE;
}

function pickTarget(currentX: number): number {
  for (let i = 0; i < 8; i++) {
    const candidate = randomX();
    if (Math.abs(candidate - currentX) >= MIN_TRAVEL) return candidate;
  }
  return currentX > 50 ? X_MIN + 5 : X_MAX - 5;
}

function randomDelay(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function WanderingPet({ petId, onCyclePet }: Props) {
  const [mode, setMode] = useState<Mode>("idle");
  const [x, setX] = useState<number>(randomX);
  const [walkMs, setWalkMs] = useState<number>(0);
  const btnRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    const el = btnRef.current;
    if (!el) return;
    el.style.setProperty("--pet-x", `${x}%`);
    el.style.setProperty("--pet-y", `${FLOOR_Y}%`);
    el.style.setProperty("--walk-ms", `${walkMs}ms`);
  }, [x, walkMs]);

  useEffect(() => {
    if (mode === "idle") {
      const delay = randomDelay(IDLE_MIN_MS, IDLE_MAX_MS);
      const id = window.setTimeout(() => {
        if (Math.random() < SLEEP_CHANCE) {
          setMode("sleeping");
          return;
        }
        const target = pickTarget(x);
        const distance = Math.abs(target - x);
        const duration = (distance / WALK_PCT_PER_SEC) * 1000;
        setWalkMs(duration);
        setX(target);
        setMode("walking");
      }, delay);
      return () => window.clearTimeout(id);
    }
    if (mode === "walking") {
      const id = window.setTimeout(() => {
        setWalkMs(0);
        setMode("idle");
      }, walkMs);
      return () => window.clearTimeout(id);
    }
    if (mode === "sleeping") {
      const delay = randomDelay(SLEEP_MIN_MS, SLEEP_MAX_MS);
      const id = window.setTimeout(() => setMode("idle"), delay);
      return () => window.clearTimeout(id);
    }
  }, [mode, x, walkMs]);

  const creature = getCreature(petId);
  const title = creature
    ? `${creature.name} — click to cycle (${creature.rarity})`
    : "Pet";

  return (
    <prim.Button
      ref={btnRef}
      variant="link"
      onClick={onCyclePet}
      title={title}
      aria-label={title}
      className={cx(
        s.wanderer,
        mode === "walking" && s.walking,
        mode === "sleeping" && s.sleeping,
      )}
    >
      {mode === "sleeping" && (
        <prim.Text as="span" aria-hidden className={s.zzz}>
          z
        </prim.Text>
      )}
      <PetSprite
        creature={petId}
        size="sm"
        sad={mode === "sleeping"}
        paused={mode === "sleeping"}
      />
    </prim.Button>
  );
}
