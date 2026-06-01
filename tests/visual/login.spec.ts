import { test, expect } from '@playwright/test'
import { launchApp } from './harness'

test('LoginScreen renders in light mode', async () => {
  const { win, cleanup } = await launchApp({ mode: 'light' })
  try {
    await win.getByPlaceholder('Username').waitFor({ timeout: 15_000 })
    await win.waitForTimeout(500)
    await expect(win).toHaveScreenshot('login-light.png', { fullPage: true })
  } finally {
    await cleanup()
  }
})

test('LoginScreen renders in dark mode', async () => {
  const { win, cleanup } = await launchApp({ mode: 'dark' })
  try {
    await win.getByPlaceholder('Username').waitFor({ timeout: 15_000 })
    await win.waitForTimeout(500)
    await expect(win).toHaveScreenshot('login-dark.png', { fullPage: true })
  } finally {
    await cleanup()
  }
})
