import { test, expect } from '@playwright/test'
import { launchApp, skipTourIfPresent } from './harness'

test('WeekView, light mode', async () => {
  const { win, cleanup } = await launchApp({ mockApi: true, mode: 'light' })
  try {
    await skipTourIfPresent(win)
    await win.getByRole('tab', { name: 'History' }).click()
    await win.getByRole('tab', { name: 'Weekly' }).click()
    await win.waitForTimeout(1500)
    await expect(win).toHaveScreenshot('week-light.png', { fullPage: true })
  } finally {
    await cleanup()
  }
})

test('WeekView, dark mode', async () => {
  const { win, cleanup } = await launchApp({ mockApi: true, mode: 'dark' })
  try {
    await skipTourIfPresent(win)
    await win.getByRole('tab', { name: 'History' }).click()
    await win.getByRole('tab', { name: 'Weekly' }).click()
    await win.waitForTimeout(1500)
    await expect(win).toHaveScreenshot('week-dark.png', { fullPage: true })
  } finally {
    await cleanup()
  }
})
