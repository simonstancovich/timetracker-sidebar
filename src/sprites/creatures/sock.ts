import type { PetCreature } from "../petSprites";

const PAL = {
  s: "#fff5e8",
  S: "#d4c4b0",
  r: "#c83040",
  e: "#1a1208",
  m: "#9c1820",
};

const idle1 = {
  palette: PAL,
  grid: `
..............
...ssss.......
..sSSSSs......
..sSrrSss.....
..sSSSSSss....
..sSeSSSSss...
..sSSSSSSSss..
..sSSSSSSSSss.
..sSSSSSSSSSss
..sSSSmmmSSSSs
..sSSmmmmmSSSs
..sSSSSSSSSSSs
..ssssssssssss
..............`.trim(),
};

const idle2 = {
  palette: PAL,
  grid: `
...ssss.......
..sSSSSs......
..sSrrSss.....
..sSSSSSss....
..sSeSSSSss...
..sSSSSSSSss..
..sSSSSSSSSss.
..sSSSSSSSSSss
..sSSSmmmSSSSs
..sSSmmmmmSSSs
..sSSSSSSSSSSs
..ssssssssssss
..............
..............`.trim(),
};

const creature: PetCreature = {
  id: "sock",
  name: "Sock Puppet",
  rarity: "common",
  flavor: "Speaks only in standup.",
  animations: { idle: { frames: [idle1, idle2], fps: 3.2 } },
};

export default creature;
