// Box dimension tokens — width/height for square/fixed-size primitives
// (IconTile, Avatar, chip dots, etc.). Kept separate from `spacing` because
// dimensions and internal-padding serve different roles and shouldn't share
// a scale that could drift between them.

export const sizes = {
  xs:    20,
  sm:    24,
  md:    32,
  lg:    48,
  xl:    64,
  '2xl': 80,
} as const
