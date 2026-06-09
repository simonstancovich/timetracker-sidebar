import type { PetCreature } from "../petSprites";

const PAL = {
  r: "#d44848",
  R: "#9c2424",
  w: "#fff8e8",
  c: "#f0d8a0",
  C: "#c8a868",
  e: "#1a0e0e",
  m: "#7a3030",
};

const idle1 = {
  palette: PAL,
  grid: `
......rrrr....
....rrrrrrrr..
...rrwrrrrwrr.
..rrrrrwwrrrrr
..rRrwrrrrrrwr
..rRRRrrrrrRRr
..rRRRRRRRRRRr
...mmmccccmm..
....cceccecc..
....cccmmccc..
....cccccccc..
....cccccccc..
....cccccccc..
.....cccccc...`.trim(),
};

const idle2 = {
  palette: PAL,
  grid: `
.....rrrrr....
....rrrrrrrr..
...rrwrrrrwrr.
..rrrrrwwrrrrr
..rRrwrrrrrrwr
..rRRRrrrrrRRr
..rRRRRRRRRRRr
...mmmccccmm..
....cccceccc..
....cceccmccc.
....cccmmcccc.
....cccccccc..
.....cccccc...
.....cccccc...`.trim(),
};

const creature: PetCreature = {
  id: "mushroom",
  name: "Mushroom",
  rarity: "rare",
  flavor: "Spores out scope creep.",
  animations: { idle: { frames: [idle1, idle2], fps: 1.6 } },
};

export default creature;
