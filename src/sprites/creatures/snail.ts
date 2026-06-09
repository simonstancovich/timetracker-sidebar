import type { PetCreature } from "../petSprites";

const PAL = {
  s: "#c69a4a",
  S: "#8a6628",
  d: "#5a4416",
  b: "#e3c084",
  e: "#1a1208",
  a: "#3a2c0e",
};

const idle1 = {
  palette: PAL,
  grid: `
....a.....a...
....a.....a...
.....SSSS.....
....SsssSS....
...SssSsssS...
..SsSdddSssS..
..SsSdSSdSsS..
..SsSdSSdSsS..
..SsSdddSsSb..
..SsSssssSbbb.
..bSSssssSbbbb
.bbbbeebbbbbbb
.bbbbbbbbbbbb.
..............`.trim(),
};

const idle2 = {
  palette: PAL,
  grid: `
.....a....a...
....a.....a...
.....SSSS.....
....SsssSS....
...SssSsssS...
..SsSdddSssS..
..SsSdSSdSsS..
..SsSdSSdSsS..
..SsSdddSsSb..
.bSsSssssSbbb.
bbbbSssssSbbbb
.bbbbeebbbbbb.
..bbbbbbbbbb..
..............`.trim(),
};

const creature: PetCreature = {
  id: "snail",
  name: "Snail",
  rarity: "rare",
  flavor: "Slow hours are still hours.",
  animations: { idle: { frames: [idle1, idle2], fps: 1.2 } },
};

export default creature;
