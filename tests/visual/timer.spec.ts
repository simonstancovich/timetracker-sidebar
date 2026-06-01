import { test, expect } from '@playwright/test'
import { launchApp, skipTourIfPresent } from './harness'

test('TimerView idle, light mode', async () => {
  const { win, cleanup } = await launchApp({ mockApi: true, mode: 'light' })
  try {
    await skipTourIfPresent(win)
    await win.getByRole('tab', { name: 'Timer' }).click()
    await win.waitForTimeout(1000)
    await expect(win).toHaveScreenshot('timer-idle-light.png', { fullPage: true })
  } finally {
    await cleanup()
  }
})

test('TimerView idle, dark mode', async () => {
  const { win, cleanup } = await launchApp({ mockApi: true, mode: 'dark' })
  try {
    await skipTourIfPresent(win)
    await win.getByRole('tab', { name: 'Timer' }).click()
    await win.waitForTimeout(1000)
    await expect(win).toHaveScreenshot('timer-idle-dark.png', { fullPage: true })
  } finally {
    await cleanup()
  }
})
