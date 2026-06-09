import type { PetCreature } from "../petSprites";

const PAL = { m: "#9c948b", M: "#cfc7bd", e: "#1a1612", n: "#e8a0a8" };

const idle1 = {
  palette: PAL,
  grid: `
..............
..mm......mm..
.mMMm....mMMm.
.mMMmmmmmmMMm.
.mMMMMMMMMMMm.
.mMMeMMMMeMMm.
.mMMMMMMMMMMm.
.mMMMMnnMMMMm.
.mMMMMMMMMMMm.
.mMMMMMMMMMMm.
.mMMMMMMMMMMm.
..mmMMMMMMmm..
....mmmmmm....
..............`.trim(),
};

const idle2 = {
  palette: PAL,
  grid: `
..............
.mmm......mmm.
.mMMm....mMMm.
.mMMmmmmmmMMm.
.mMMMMMMMMMMm.
.mMMeMMMMeMMm.
.mMMMMMMMMMMm.
.mMMMMnnMMMMm.
.mMMMMMMMMMMm.
.mMMMMMMMMMMm.
..mMMMMMMMMm..
..mmMMMMMMmm..
....mmmmmm....
..............`.trim(),
};

const creature: PetCreature = {
  id: "mouse",
  name: "Mouse",
  rarity: "common",
  flavor: "Knows every shortcut.",
  animations: { idle: { frames: [idle1, idle2], fps: 3 } },
};

export default creature;
