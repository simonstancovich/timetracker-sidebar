export function isTestMode(): boolean {
  return (
    typeof window !== 'undefined' &&
    (window as unknown as { __PLAYWRIGHT_TEST__?: boolean }).__PLAYWRIGHT_TEST__ === true
  )
}
