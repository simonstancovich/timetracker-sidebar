import type { PetCreature } from "../petSprites";

const PAL = {
  f: "#ff7a28",
  F: "#ffb850",
  g: "#e8c050",
  G: "#a0701c",
  o: "#fff0a0",
  e: "#3a1408",
  m: "#9c2010",
};

const idle1 = {
  palette: PAL,
  grid: `
......f.......
.....fFf......
....ffFFf.....
...ffFFFFf....
....fFFFFf....
....fgGGgf....
...fgGoGoGgf..
...fgGoGGoGgf.
...fgGmmmmGgf.
...fgGGGGGGgf.
....fgGGGGgf..
.....fgggf....
....ff....ff..
...ff......ff.`.trim(),
};

const idle2 = {
  palette: PAL,
  grid: `
.....f...f....
....fFf.fFf...
....ffFffFf...
...ffFFFFFf...
....fFFFFf....
....fgGGgf....
...fgGoGGoGgf.
...fgGoGGoGgf.
...fgGmmmmGgf.
...fgGGGGGGgf.
....fgGGGGgf..
.....fgggf....
...ff......ff.
..ff........ff`.trim(),
};

const creature: PetCreature = {
  id: "phoenix",
  name: "Phoenix",
  rarity: "epic",
  flavor: "Reborn after every retro.",
  animations: { idle: { frames: [idle1, idle2], fps: 2.4 } },
};

export default creature;
