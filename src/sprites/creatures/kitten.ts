import type { PetCreature } from "../petSprites";

const PAL = {
  k: "#b08a64",
  K: "#e8c598",
  e: "#1a1208",
  n: "#d4546a",
  w: "#fff8e8",
};

const idle1 = {
  palette: PAL,
  grid: `
...k......k...
..kKk....kKk..
..kKKk..kKKk..
..kKKkkkkKKk..
.kKKKKKKKKKKk.
.kKeKKKKKKeKk.
.kKKKKnKnKKKk.
.kKKKKKKKKKKk.
.kKKKKwwwwKKk.
.kKKKKKKKKKKk.
kKKKKKKKKKKKKk
.kKKKKKKKKKKk.
..kKKKKKKKKk..
...kk....kk...`.trim(),
};

const idle2 = {
  palette: PAL,
  grid: `
..............
..kk......kk..
..kKk....kKk..
..kKKkkkkKKk..
.kKKKKKKKKKKk.
.kKeKKKKKKeKk.
.kKKKKnKnKKKk.
.kKKKKKKKKKKk.
.kKKKwwwwwwKk.
.kKKKKKKKKKKk.
.kKKKKKKKKKKk.
kKKKKKKKKKKKKk
.kKKKKKKKKKKk.
...kk....kk...`.trim(),
};

const creature: PetCreature = {
  id: "kitten",
  name: "Kitten",
  rarity: "common",
  flavor: "Will absolutely sit on your keyboard.",
  animations: { idle: { frames: [idle1, idle2], fps: 1.8 } },
};

export default creature;
