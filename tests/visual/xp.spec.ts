import { test, expect } from '@playwright/test'
import { launchApp, skipTourIfPresent } from './harness'

test('XpView, light mode', async () => {
  const { win, cleanup } = await launchApp({ mockApi: true, mode: 'light' })
  try {
    await skipTourIfPresent(win)
    await win.getByRole('tab', { name: 'XP' }).click()
    await win.waitForTimeout(1500)
    await expect(win).toHaveScreenshot('xp-light.png', { fullPage: true })
  } finally {
    await cleanup()
  }
})
