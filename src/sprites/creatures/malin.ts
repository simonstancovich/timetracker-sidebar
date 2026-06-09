import type { PetCreature } from "../petSprites";

const PAL = {
  h: "#e8c878",
  H: "#a8843a",
  s: "#f4d4b4",
  e: "#2a1810",
  m: "#a84858",
  k: "#1a1612",
  v: "#d4c8b4",
  g: "#d4d4d8",
  G: "#8a8a90",
};

const idle1 = {
  palette: PAL,
  grid: `
....hhhhhh....
...hHhhhhHh...
..hHssssssHh..
..hsessssseh..
.hHssssssssHh.
.hHssmmmmssHh.
ghHssssssssHhg
G.hssssssssh.G
.hHssssssssHh.
..kkkvgvkkkk..
.kkkkkgkkkkkk.
.kkkkkgkkkkkk.
.kkkkGgGkkkkk.
.kkkkkkkkkkkk.`.trim(),
};

const idle2 = {
  palette: PAL,
  grid: `
....hhhhhh....
...hHhhhhHh...
..hHssssssHh..
..hsessssseh..
.hHssssssssHh.
.hHsmmmmmmsHh.
ghHssssssssHhg
G.hssssssssh.G
.hHssssssssHh.
..kkkvgvkkkk..
.kkkkkgkkkkkk.
.kkkkkgkkkkkk.
.kkkkGgGkkkkk.
.kkkkkkkkkkkk.`.trim(),
};

const creature: PetCreature = {
  id: "malin",
  name: "Malin",
  rarity: "limited",
  flavor: "Long blonde, big earrings, longer necklace — boardroom mode.",
  animations: { idle: { frames: [idle1, idle2], fps: 1.3 } },
};

export default creature;
