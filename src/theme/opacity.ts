// Opacity tokens. Semantic names for the handful of alpha values the UI
// actually uses. Any primitive with a "disabled" state should use
// `opacity.disabled` so the visual weight is consistent across the app.

export const opacity = {
  full:     1,
  disabled: 0.5,
  hidden:   0,
} as const
