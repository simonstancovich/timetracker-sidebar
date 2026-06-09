import type { PetCreature } from "../petSprites";

const PAL = { p: "#e88a98", P: "#f4b6c1", e: "#3a1820", m: "#c8546a" };

const idle1 = {
  palette: PAL,
  grid: `
..............
......pppp....
.....pPPPPp...
....pPPPPPPp..
...pPPPPPPPPp.
...pPePPPPePp.
...pPPPPPPPPp.
...pPPmmmmPPp.
..pPPPPPPPPPPp
..pPPPPPPPPPPp
..pPPPPPPPPPPp
...pPPPPPPPPp.
....pPPPPPPp..
.....pppppp...`.trim(),
};

const idle2 = {
  palette: PAL,
  grid: `
......pppp....
.....pPPPPp...
....pPPPPPPp..
...pPePPPePp..
...pPPPPPPPPp.
..pPPPPPPPPPp.
..pPPmmmmPPPp.
..pPPPPPPPPPPp
..pPPPPPPPPPPp
..pPPPPPPPPPPp
...pPPPPPPPPp.
....pPPPPPPp..
.....pppppp...
..............`.trim(),
};

const creature: PetCreature = {
  id: "bean",
  name: "Bean",
  rarity: "common",
  flavor: "Smiles through standups.",
  animations: { idle: { frames: [idle1, idle2], fps: 1.6 } },
};

export default creature;
