import type { PetCreature } from "../petSprites";

const PAL = {
  d: "#5a1010",
  D: "#a82018",
  E: "#ffd038",
  m: "#1a0408",
  F: "#fff0d0",
};

const idle1 = {
  palette: PAL,
  grid: `
...d......d...
...dd....dd...
....dddddddd..
...dDDDDDDDDd.
..dDDDDDDDDDDd
.dDDEDDDDDDEDd
.dDDDDDDDDDDDd
.dDDDDmmmmDDDd
.dDDDmFFFFmDDd
.dDDDFFFFFFDDd
.dDDDDFFFFDDDd
..dDDDDDDDDDd.
...dDDDDDDDd..
....ddddddd...`.trim(),
};

const idle2 = {
  palette: PAL,
  grid: `
...d......d...
...dd....dd...
....dddddddd..
...dDDDDDDDDd.
..dDDDDDDDDDDd
.dDDEDDDDDDEDd
.dDDDDDDDDDDDd
.dDDmmmmmmmDDd
.dDDmFFFFFFmDd
.dDDDFFFFFFDDd
.dDDDDFFFFDDDd
..dDDDDDDDDDd.
...dDDDDDDDd..
....ddddddd...`.trim(),
};

const creature: PetCreature = {
  id: "demon",
  name: "Imp",
  rarity: "epic",
  flavor: "Whispers “just one more PR.”",
  animations: { idle: { frames: [idle1, idle2], fps: 2.5 } },
};

export default creature;
