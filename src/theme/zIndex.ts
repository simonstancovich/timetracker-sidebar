// Z-index scale. Named layers so call sites don't pick magic numbers and we
// can re-stack the whole UI by editing one file.

export const zIndex = {
  base: 0,
  dropdown: 50,
  pinnedFloat: 99,         // floating XP / save toasts
  pinnedFloatTop: 100,     // achievement unlock toast
  modalBackdrop: 200,
  modal: 201,
  introMask: 499,          // intro overlay's cutout mask
  introHighlight: 500,     // intro overlay's pulsing highlight ring
  introTooltip: 501,       // intro overlay's tooltip card
} as const
