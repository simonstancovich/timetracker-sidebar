import type { PetCreature } from "../petSprites";

const PAL = {
  h: "#d97a3a",
  H: "#a8541c",
  s: "#f4d4b4",
  b: "#c8601c",
  e: "#2a1810",
  m: "#a85040",
  d: "#6a8eb8",
  D: "#3a5a82",
  w: "#e8eef2",
};

const idle1 = {
  palette: PAL,
  grid: `
......hh......
.....hHHh.....
....hHHhHh....
...hHHHHHHh...
..hHsssssshh..
..hsessssseh..
..hssssssssh..
..bssssssssb..
..bbssmmsssbb.
...bbsmmsbb...
....bbbbbb....
..dddddddddd..
..dDDDDwDDDDd.
..ddDDDDDDdd..`.trim(),
};

const idle2 = {
  palette: PAL,
  grid: `
......hh......
.....hHHh.....
....hHHhHh....
...hHHHHHHh...
..hHsssssshh..
..hsmmsssmmh..
..hssssssssh..
..bssssssssb..
..bbssmmmsbbb.
...bbsmmsbb...
....bbbbbb....
..dddddddddd..
..dDDDDwDDDDd.
..ddDDDDDDdd..`.trim(),
};

const creature: PetCreature = {
  id: "markus",
  name: "Markus",
  rarity: "limited",
  flavor: "Ginger beard, denim shirt, approves your timesheet.",
  animations: { idle: { frames: [idle1, idle2], fps: 1.4 } },
};

export default creature;
