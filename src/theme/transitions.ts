// Motion tokens — durations + easings. Keep the palette small; consistency
// is more useful than a wide vocabulary.

export const duration = {
  instant: 100,    // XP bump pop
  fast:    200,    // small reveals (toggle, fade)
  base:    220,    // delete-confirm slide-down
  medium:  500,    // progress bar width
  slow:    900,    // spinner rotation
} as const

export const easing = {
  standard: 'ease',
  out:      'ease-out',
  inOut:    'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce:   'cubic-bezier(.34,1.56,.64,1)',  // achievement unlock pop
  linear:   'linear',
} as const

// Pre-composed transition strings for common patterns.
export const transitions = {
  none: 'none',
  colorBg: `background ${duration.fast}ms ${easing.out}`,
  width: `width ${duration.medium}ms`,
  maxHeight: `max-height ${duration.base}ms ${easing.standard}`,
  transform: `transform ${duration.fast}ms`,
} as const
