// Content / container width tokens. Kept separate from `spacing` because
// widths govern how wide something can grow (max-width), not internal gaps.
// Any primitive that caps content width (`<Text maxWidth={…}>`, future
// `<Card>`, etc.) reads from here so the set of readable-column widths is
// defined once.

export const widths = {
  narrow: 200,
  prose:  280,
  md:     400,
  lg:     640,
  full:   '100%',
} as const
