// Box-shadow tokens. The `brand` and `heavy` variants are the ones used by
// `colors.light.bsh` and `colors.dark.bsh`; new shadows should be added here
// rather than inline.

export const shadows = {
  none: 'none',
  brand: '0 4px 14px rgba(124,58,237,.35)',  // light-mode primary button
  heavy: '0 8px 24px rgba(0,0,0,0.5)',       // dark-mode primary button
  card:  '0 12px 32px rgba(0,0,0,0.4)',
  toast: '0 12px 32px rgba(0,0,0,0.25)',
} as const
