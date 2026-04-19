// Border-radius tokens. Numeric (no `px` suffix) so they drop straight into
// inline styles. `pill` uses a sentinel large value so the renderer rounds
// corners regardless of element size; `circle` is the special-case '50%'.

export const radii = {
  none: 0,
  xs:   6,
  sm:   7,
  md:   8,
  lg:   9,
  xl:   10,
  '2xl': 11,
  '3xl': 12,
  '4xl': 13,
  '5xl': 14,
  pill: 100,
  circle: '50%',
} as const
