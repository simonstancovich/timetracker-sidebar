import type { PetCreature } from "../petSprites";

const PAL = {
  M: "#1a0c08",
  s: "#e8be9c",
  S: "#c89880",
  e: "#1a0c08",
  t: "#6c3a20",
  m: "#6c3a20",
};

const idle1 = {
  palette: PAL,
  grid: `
..............
..............
.MMMMMMMMMMMM.
MMMMMMMMMMMMMM
.MM.MMMMMMM.MM
.M..MMMMMMM..M
....sssssss...
...sseesseess.
...sssssssss..
...sssmmmsss..
....sssssss...
.....sssss....
......sss.....
......sss.....`.trim(),
};

const idle2 = {
  palette: PAL,
  grid: `
..............
..MMMMMMMMMM..
.MMMMMMMMMMMM.
MMMMMMMMMMMMMM
.MM.MMMMMMM.MM
.M.MMMMMMMM..M
....sssssss...
...sseessees..
...sssssssss..
...ssssmmsss..
....sssssss...
.....sssss....
.....SSSSS....
.....SSSSS....`.trim(),
};

const creature: PetCreature = {
  id: "mustache",
  name: "Mustachio",
  rarity: "common",
  flavor: "Twirls his ends between meetings.",
  animations: { idle: { frames: [idle1, idle2], fps: 2 } },
};

export default creature;
