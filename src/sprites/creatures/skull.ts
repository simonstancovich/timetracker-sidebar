import type { PetCreature } from "../petSprites";

const PAL = {
  w: "#f0e8d8",
  W: "#a8a094",
  e: "#0a0608",
  m: "#3a3028",
  K: "#1a0808",
};

const idle1 = {
  palette: PAL,
  grid: `
.K..........K.
.KK........KK.
.KKK......KKK.
..wwwwwwwwww..
.wWWWWWWWWWWw.
wWeeWWWWWWeeWw
wWeeWWWWWWeeWw
wWWWWWWWWWWWWw
wWWWWWmmWWWWWw
.wWWWWWWWWWWw.
.wmWmWmWmWmWw.
..mWmWmWmWmW..
...wwwwwwww...
....ww..ww....`.trim(),
};

const idle2 = {
  palette: PAL,
  grid: `
.K..........K.
.KK........KK.
.KKK......KKK.
..wwwwwwwwww..
.wWWWWWWWWWWw.
wWeeWWWWWWeeWw
wWeeWWWWWWeeWw
wWWWWWWWWWWWWw
wWWWWmmmmWWWWw
.wWWWWWWWWWWw.
.wmWmWmWmWmWw.
..mWmWmWmWmW..
...wwwwwwww...
....ww..ww....`.trim(),
};

const creature: PetCreature = {
  id: "skull",
  name: "Crowned Skull",
  rarity: "epic",
  flavor: "Wears your deadlines as horns.",
  animations: { idle: { frames: [idle1, idle2], fps: 1.8 } },
};

export default creature;
