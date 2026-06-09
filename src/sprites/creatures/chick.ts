import type { PetCreature } from "../petSprites";

const PAL = { b: "#f7d99c", B: "#e8b76f", e: "#2a1f14", m: "#d4684f" };

const idle1 = {
  palette: PAL,
  grid: `
..............
.....bbbb.....
....bbBBbb....
...bbBBBBbb...
..bbBeBBeBbb..
..bbBBBBBBBb..
.bbBBBmmBBBBb.
.bbBBmmmmBBBb.
.bbBBBBBBBBBb.
..bbBBBBBBbb..
...bbbbbbbb...
....bb..bb....
...bb....bb...
..............`.trim(),
};

const idle2 = {
  palette: PAL,
  grid: `
..............
..............
.....bbbb.....
....bbBBbb....
...bbBeBBebb..
..bbBBBBBBBb..
..bBBBmmBBBb..
..bBBmmmmBBb..
..bBBBBBBBBb..
...bbBBBBbb...
....bbbbbb....
....bb..bb....
...bb....bb...
..............`.trim(),
};

const creature: PetCreature = {
  id: "chick",
  name: "Chick",
  rarity: "common",
  flavor: "Tiny, fierce, billable.",
  animations: { idle: { frames: [idle1, idle2], fps: 2.5 } },
};

export default creature;
