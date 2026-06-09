import type { PetCreature } from "../petSprites";

const PAL = {
  v: "#3d7048",
  V: "#5fa066",
  h: "#f0d8a0",
  b: "#c8b890",
  e: "#fff050",
  w: "#a0d4a8",
  m: "#7a1010",
};

const idle1 = {
  palette: PAL,
  grid: `
....h....h....
....hh..hh....
....vvvvvv....
...vvVVVVvv...
..vvVVVVVVvv..
.wvVeVVVVeVvw.
wvvVVVVVVVVvvw
wvVVbbVVbbVVvw
.vVVVbbbbVVVv.
.vVVVbmmbVVVv.
..vVVVVVVVVv..
..vvVVVVVVvv..
...vvvvvvvv...
....vv..vv....`.trim(),
};

const idle2 = {
  palette: PAL,
  grid: `
....h....h....
....hh..hh....
....vvvvvv....
...vvVVVVvv...
..vvVVVVVVvv..
.wvVeVVVVeVvw.
.wvVVVVVVVVvw.
wvVVbbVVbbVVvw
wvVVVbbbbVVVvw
.vVVVbmmbVVVv.
.vVVVVVVVVVVv.
..vvVVVVVVvv..
...vvvvvvvv...
....vv..vv....`.trim(),
};

const creature: PetCreature = {
  id: "dragon",
  name: "Dragon Whelp",
  rarity: "epic",
  flavor: "Hoards approved POs.",
  animations: { idle: { frames: [idle1, idle2], fps: 2.2 } },
};

export default creature;
