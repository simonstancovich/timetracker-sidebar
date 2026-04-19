// Border-radius tokens. Clean t-shirt scale (no 1-px-increment granularity).
// `pill` uses a sentinel large value so corners round regardless of element
// size; `circle` is the special-case '50%'.

export const radii = {
  none:   0,
  xs:     6,
  sm:     8,
  md:     10,
  lg:     12,
  xl:     14,
  '2xl':  18,
  pill:   100,
  circle: '50%',
} as const
