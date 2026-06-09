import type { PetCreature } from "../petSprites";

const PAL = {
  w: "#fff8e8",
  W: "#c8b8a0",
  I: "#3a78c8",
  V: "#5aa0e8",
  k: "#0a0608",
  r: "#e84858",
  b: "#1a1208",
};

const idle1 = {
  palette: PAL,
  grid: `
......w.w.....
.....wwwww....
....wwwwwww...
...wWWWWWWWw..
..wWVVVVVVVWw.
..wVVVIIIIVVw.
.wWVIIIkkIIVWw
.wWVIIIkkIIVWw
..wVVVIIIIVVw.
..wWVVVVVVVWw.
...wWWWWWWWw..
....wwwwwww...
....b.....b...
...bb.....bb..`.trim(),
};

const idle2 = {
  palette: PAL,
  grid: `
......w.w.....
.....wwwww....
....wwwwwww...
...wWWWWWWWw..
..wWVVVVVVVWw.
..wVVkkIIIIVw.
.wWVkkkIIIIVWw
.wWVkkkIIIIVWw
..wVVIIIIIIVw.
..wWVVVVVVVWw.
...wWWWWWWWw..
....wwwwwww...
...bb.....b...
..bb......bb..`.trim(),
};

const creature: PetCreature = {
  id: "eyeball",
  name: "Eyeball Goblin",
  rarity: "epic",
  flavor: "Cannot un-see your code.",
  animations: { idle: { frames: [idle1, idle2], fps: 3 } },
};

export default creature;
