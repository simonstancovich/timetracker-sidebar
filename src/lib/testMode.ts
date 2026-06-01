export function isTestMode(): boolean {
  return (
    typeof window !== 'undefined' &&
    (window as unknown as { __PLAYWRIGHT_TEST__?: boolean }).__PLAYWRIGHT_TEST__ === true
  )
}

export function testModeOverrideMode(): 'light' | 'dark' | null {
  if (typeof window === 'undefined') return null
  const v = (window as unknown as { __PLAYWRIGHT_MODE__?: 'light' | 'dark' | null }).__PLAYWRIGHT_MODE__
  return v === 'dark' || v === 'light' ? v : null
}
