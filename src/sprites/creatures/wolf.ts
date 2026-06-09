import type { PetCreature } from "../petSprites";

const PAL = {
  w: "#9c948b",
  W: "#5a544d",
  e: "#e83020",
  f: "#fff8e8",
  m: "#3a1812",
};

const idle1 = {
  palette: PAL,
  grid: `
..w.......w...
..ww.....ww...
..wWw...wWw...
..wWWwwwWWw...
.wWWWWWWWWWw..
.wWWeWWWWeWw..
.wWWWWWWWWWWw.
wWWfWWmmWWfWWw
wWWWfWmmWfWWWw
.wWWWmmmmWWWw.
.wWWWWWWWWWWw.
..wWWWWWWWWw..
...wwwwwwww...
......ww......`.trim(),
};

const idle2 = {
  palette: PAL,
  grid: `
..w.......w...
..ww.....ww...
..wWw...wWw...
..wWWwwwWWw...
.wWWWWWWWWWw..
.wWWeWWWWeWw..
.wWWWWWWWWWWw.
wWWfWWmmWWfWWw
wWWWfWmmWfWWWw
.wWWWmmmmWWWw.
.wWWWWWWWWWWw.
..wWWWWWWWWw..
...wwwwwwww...
....ww..ww....`.trim(),
};

const creature: PetCreature = {
  id: "wolf",
  name: "Lone Wolf",
  rarity: "rare",
  flavor: "Hunts unbilled hours.",
  animations: { idle: { frames: [idle1, idle2], fps: 2 } },
};

export default creature;
