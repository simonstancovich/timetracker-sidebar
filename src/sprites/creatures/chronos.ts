import type { PetCreature } from "../petSprites";

const PAL = {
  z: "#5a3a8a",
  Z: "#3a2060",
  g: "#d4a838",
  G: "#9c7820",
  w: "#fff0d0",
  k: "#1a1018",
  e: "#fff8d8",
};

const idle1 = {
  palette: PAL,
  grid: `
.....zzzz.....
...zzZZZZzz...
..zZgggggggZz.
.zZgwwwwwwwgZz
.zZgwwgkgwwgZz
zZgwwwwkwwwwgZ
zZgwwgggkkkwgZ
zZgwwwwwkwwwgZ
zZgwwwwwkwwwgZ
.zZgwwwwwwwgZz
.zZgwwwwwwwgZz
..zZgggggggZz.
...zzZZZZzz...
.....zzzz.....`.trim(),
};

const idle2 = {
  palette: PAL,
  grid: `
.....zzzz.....
...zzZZZZzz...
..zZgggggggZz.
.zZgwwwwwwwgZz
.zZgwwgkgwwgZz
zZgwwwwkwwwwgZ
zZgwwwgkwkwwgZ
zZgwwwwkwwwwgZ
zZgwwwwwwwwwgZ
.zZgwwwwwwwgZz
.zZgwwwwwwwgZz
..zZgggggggZz.
...zzZZZZzz...
.....zzzz.....`.trim(),
};

const creature: PetCreature = {
  id: "chronos",
  name: "Chronos",
  rarity: "unique",
  flavor: "Always on the clock.",
  animations: { idle: { frames: [idle1, idle2], fps: 1.5 } },
};

export default creature;
