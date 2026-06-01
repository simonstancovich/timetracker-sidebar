import { test, expect } from '@playwright/test'
import { launchApp, skipTourIfPresent } from './harness'

test('AbsenceForm initial state, light mode', async () => {
  const { win, cleanup } = await launchApp({ mockApi: true, mode: 'light' })
  try {
    await skipTourIfPresent(win)
    await win.getByRole('tab', { name: 'Timer' }).click()
    await win.getByRole('button', { name: 'Report absence' }).click()
    await win.getByText('Type of absence').waitFor({ timeout: 10_000 })
    await win.waitForTimeout(1000)
    await expect(win).toHaveScreenshot('absence-light.png', { fullPage: true })
  } finally {
    await cleanup()
  }
})
