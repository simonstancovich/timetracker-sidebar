// 14x14 pixel sprite encoding for pet creatures.
// Each creature lives in src/sprites/creatures/<id>.ts as a default export.
// Drop a new file in that folder — it auto-appears in PET_CREATURES via the
// import.meta.glob below.

export const SPRITE_SIZE = 14;

export interface PetSprite {
  grid: string;
  palette: Record<string, string>;
}

export interface PetAnimation {
  frames: PetSprite[];
  fps: number;
}

export type PetAnimKind = "idle" | "eat" | "happy" | "sad";
export type PetRarity = "common" | "rare" | "epic" | "unique" | "limited";

export interface PetCreature {
  id: string;
  name: string;
  rarity: PetRarity;
  flavor: string;
  animations: Partial<Record<PetAnimKind, PetAnimation>>;
}

export const RARITY_ORDER: PetRarity[] = [
  "common",
  "rare",
  "epic",
  "unique",
  "limited",
];

const modules = import.meta.glob<{ default: PetCreature }>(
  "./creatures/*.ts",
  { eager: true },
);

const rarityIndex = (r: PetRarity) => RARITY_ORDER.indexOf(r);

export const PET_CREATURES: PetCreature[] = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => {
    const dr = rarityIndex(a.rarity) - rarityIndex(b.rarity);
    if (dr !== 0) return dr;
    return a.name.localeCompare(b.name);
  });

export interface ParsedRect {
  x: number;
  y: number;
  color: string;
}

export function parseSprite(sprite: PetSprite): ParsedRect[] {
  const lines = sprite.grid.split("\n");
  const rects: ParsedRect[] = [];
  for (let y = 0; y < lines.length; y++) {
    const line = lines[y];
    if (!line) continue;
    for (let x = 0; x < line.length; x++) {
      const ch = line[x];
      if (ch === "." || ch === undefined) continue;
      const color = sprite.palette[ch];
      if (!color) continue;
      rects.push({ x, y, color });
    }
  }
  return rects;
}

export function getCreature(id: string): PetCreature | undefined {
  return PET_CREATURES.find((c) => c.id === id);
}
