import type { PetCreature } from "../petSprites";

const PAL = {
  b: "#e8a8c0",
  B: "#fff5e8",
  p: "#f48fb4",
  e: "#3a1820",
  m: "#c8546a",
  o: "#3a1820",
};

const idle1 = {
  palette: PAL,
  grid: `
...bb....bb...
..bppb..bppb..
..bppb..bppb..
..bppb..bppb..
..bbbbbbbbbb..
.bBBBBBBBBBBb.
.bBeBBBBBBeBb.
.bBBBBBBBBBBb.
.bBBBmmmmBBBb.
.bBBBBBBBBBBb.
.bBBBBBBBBBBb.
..bBBBBBBBBb..
...bBBBBBBb...
....bbbbbb....`.trim(),
};

const idle2 = {
  palette: PAL,
  grid: `
...bb....bb...
..bppb..bppb..
..bppb..bppb..
..bppb..bppb..
..bbbbbbbbbb..
.bBBBBBBBBBBb.
.bBoBBBBBBoBb.
.bBBBBBBBBBBb.
.bBBBBmmBBBBb.
.bBBBBBBBBBBb.
.bBBBBBBBBBBb.
..bBBBBBBBBb..
...bBBBBBBb...
....bbbbbb....`.trim(),
};

const creature: PetCreature = {
  id: "bunny",
  name: "Bunny",
  rarity: "common",
  flavor: "Soft mode advocate.",
  animations: { idle: { frames: [idle1, idle2], fps: 1.4 } },
};

export default creature;
