import type { PetCreature } from "../petSprites";

const PAL = {
  k: "#0a0612",
  K: "#1a0e24",
  v: "#7a40c8",
  V: "#a868f0",
  w: "#f0d8ff",
  e: "#240a3a",
};

const idle1 = {
  palette: PAL,
  grid: `
..............
...v......v...
..vK.kkkk..Kv.
.vKkkkkkkkkKv.
.vKkkVVVVkkKv.
vKkkVVvvVVkkKv
vKkkVvVVvVkkKv
vKkkVvVVvVkkKv
vKkkVVwwVVkkKv
.vKkkVVVVkkKv.
.vKkkkkkkkkKv.
..vKkkkkkkKv..
...v......v...
..............`.trim(),
};

const idle2 = {
  palette: PAL,
  grid: `
..............
..v........v..
..vKkkkkkkkKv.
.vKkkkkkkkkKv.
.vKkkVVVVkkKv.
vKkkVVvvVVkkKv
vKkkVvvvvVkkKv
vKkkVvvvvVkkKv
vKkkVVwwVVkkKv
.vKkkVVVVkkKv.
.vKkkkkkkkkKv.
..vKkkkkkkKv..
...v......v...
..............`.trim(),
};

const creature: PetCreature = {
  id: "void",
  name: "Void Watcher",
  rarity: "unique",
  flavor: "Sees every unlogged minute.",
  animations: { idle: { frames: [idle1, idle2], fps: 1.8 } },
};

export default creature;
