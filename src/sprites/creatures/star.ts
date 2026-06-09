import type { PetCreature } from "../petSprites";

const PAL = {
  o: "#d49020",
  O: "#ffd848",
  Y: "#fff0a0",
  e: "#3a1408",
  m: "#9c4020",
};

const idle1 = {
  palette: PAL,
  grid: `
......o.......
.....oOo......
.....oOo......
....oOOOo.....
ooooOOOOOoooo.
oOOOOOOOOOOOOo
.oOOOeOOOeOOo.
..oOOOOOOOOOo.
..oOOOmmmmOOo.
..oOOOOOOOOOo.
...oOOOOOOOo..
....ooo.ooo...
....oo...oo...
...oo.....oo..`.trim(),
};

const idle2 = {
  palette: PAL,
  grid: `
......o.......
.....oOo......
.....oOo......
....oOYOo.....
ooooOOYOOoooo.
oOOOOOOOOOOOOo
.oOOOeOOOeOOo.
..oOOOOOOOOOo.
..oOOOmmmmOOo.
..oOOOYOOOOOo.
...oOOOOOOOo..
....ooo.ooo...
...oo.....oo..
..oo.......oo.`.trim(),
};

const creature: PetCreature = {
  id: "star",
  name: "Star Sprout",
  rarity: "rare",
  flavor: "Hatched the day you hit goal.",
  animations: { idle: { frames: [idle1, idle2], fps: 2 } },
};

export default creature;
