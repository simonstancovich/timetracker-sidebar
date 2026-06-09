import type { PetCreature } from "../petSprites";

const PAL = { g: "#7fb87a", G: "#4a8a4a", w: "#ffffff", e: "#0e1d0e" };

const idle1 = {
  palette: PAL,
  grid: `
..............
..............
..............
......gg......
.....gggg.....
....gGGGGGg...
...gGGwwwwGg..
..gGGewGGweGg.
..gGGGGGGGGGg.
.gGGGGGGGGGGGg
.gGGGGGGGGGGGg
.ggGGGGGGGGGgg
..gggggggggg..
..............`.trim(),
};

const idle2 = {
  palette: PAL,
  grid: `
..............
..............
......gg......
......gg......
.....gggggg...
....gGGGGGGg..
...gGGwwwwGGg.
..gGGewGGweGGg
.gGGGGGGGGGGGg
.gGGGGGGGGGGGg
.gGGGGGGGGGGGg
.gGGGGGGGGGGGg
..ggggggggggg.
..............`.trim(),
};

const creature: PetCreature = {
  id: "slime",
  name: "Slime",
  rarity: "common",
  flavor: "Sticks to deadlines.",
  animations: { idle: { frames: [idle1, idle2], fps: 2.5 } },
};

export default creature;
