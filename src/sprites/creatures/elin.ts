import type { PetCreature } from "../petSprites";

const PAL = {
  h: "#e8c878",
  H: "#a8843a",
  s: "#f4d4b4",
  e: "#2a1810",
  m: "#a84858",
  t: "#fff0e0",
  k: "#1a1612",
  K: "#0a0608",
  p: "#d8c8a8",
  P: "#5a3818",
};

const idle1 = {
  palette: PAL,
  grid: `
....hhhhhh....
...hHhhhhHh...
..hHssssssHh..
..hsessssseh..
.hHssssssssHh.
.hHssmmmmssHh.
.hHssmttmssHh.
.hHsssmmmsssHh
.hHssssssssshH
.hHkkpPpPpkkHh
.hHkpPpPpPpkHh
.hHkpPPpPpPkHh
.hHkkpPpPpkkHh
.hHkkkkkkkkkHh`.trim(),
};

const idle2 = {
  palette: PAL,
  grid: `
....hhhhhh....
...hhhHHhHh...
..hHssssssHh..
..hsessssseh..
.hHssssssssHh.
.hHsmmmmmmsHh.
.hHssmttttsHh.
.hHsssmmmsssHh
.hHssssssssshH
.hHkkpPpPpkkHh
.hHkpPpPpPpkHh
.hHkpPPpPpPkHh
.hHkkpPpPpkkHh
.hHkkkkkkkkkHh`.trim(),
};

const creature: PetCreature = {
  id: "elin",
  name: "Elin",
  rarity: "limited",
  flavor: "Long blonde hair, brighter smile than your Friday demo.",
  animations: { idle: { frames: [idle1, idle2], fps: 1.6 } },
};

export default creature;
