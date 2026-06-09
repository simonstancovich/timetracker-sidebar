import type { PetCreature } from "../petSprites";

const PAL = {
  b: "#9c6a20",
  B: "#e8b870",
  h: "#f0ce8a",
  H: "#c84830",
  m: "#f0c020",
  e: "#1a0c08",
};

const idle1 = {
  palette: PAL,
  grid: `
..............
..bbbbbbbbbb..
.bBhhhhhhhhBb.
bBhhhhhhhhhhBb
bhmmmmmmmmmmhb
bhhHHHHHHHHhhb
bhheHHHHHHehhb
bhhHHHHHHHHhhb
bhhHHHmmHHHhhb
bhhHHHHHHHHhhb
bhmmmmmmmmmmhb
bBhhhhhhhhhhBb
.bBhhhhhhhhBb.
..bbbbbbbbbb..`.trim(),
};

const idle2 = {
  palette: PAL,
  grid: `
..............
..bbbbbbbbbb..
.bBhhhhhhhhBb.
bBhhhhhhhhhhBb
bhmmmmmmmmmmhb
bhhHHHHHHHHhhb
bhheeHHHHeehhb
bhhHHHHHHHHhhb
bhhHHmmmmHHhhb
bhhHHHHHHHHhhb
bhmmmmmmmmmmhb
bBhhhhhhhhhhBb
.bBhhhhhhhhBb.
..bbbbbbbbbb..`.trim(),
};

const creature: PetCreature = {
  id: "hotdog",
  name: "Hot Dog",
  rarity: "rare",
  flavor: "Snack-driven development.",
  animations: { idle: { frames: [idle1, idle2], fps: 2.4 } },
};

export default creature;
