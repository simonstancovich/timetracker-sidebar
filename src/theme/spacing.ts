// Spacing scale — padding, margin, gap. Numeric (no `px` suffix) so tokens
// drop straight into React inline styles and vanilla-extract `style()` blocks.
// T-shirt sizing; pick one name per size and stick to it.

export const spacing = {
  none: 0,
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  '2xl': 32,
} as const
