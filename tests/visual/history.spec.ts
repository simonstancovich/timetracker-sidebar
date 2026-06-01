import { test, expect } from '@playwright/test'
import { launchApp, skipTourIfPresent } from './harness'

test('HistoryView day, light mode', async () => {
  const { win, cleanup } = await launchApp({ mockApi: true, mode: 'light' })
  try {
    await skipTourIfPresent(win)
    await win.getByRole('tab', { name: 'History' }).click()
    await win.waitForTimeout(1500)
    await expect(win).toHaveScreenshot('history-day-light.png', { fullPage: true })
  } finally {
    await cleanup()
  }
})
