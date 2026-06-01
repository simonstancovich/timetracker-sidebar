import { test, expect, _electron as electron } from '@playwright/test'
import path from 'path'
import { mkdtempSync, rmSync } from 'fs'
import { tmpdir } from 'os'

test('TodayView renders with mock entries (light mode)', async () => {
  const userDataDir = mkdtempSync(path.join(tmpdir(), 'tt-pw-'))
  const app = await electron.launch({
    args: [path.join(__dirname, '..', '..'), `--user-data-dir=${userDataDir}`],
    env: {
      ...process.env,
      PLAYWRIGHT_TEST: '1',
      PLAYWRIGHT_MOCK_API: '1',
      NODE_ENV: 'development',
    },
  })
  try {
    const win = await app.firstWindow()
    await win.waitForLoadState('domcontentloaded')
    const skip = win.getByText('Skip the tour', { exact: false })
    await skip.waitFor({ timeout: 15_000 })
    await skip.click()
    await skip.waitFor({ state: 'detached', timeout: 10_000 })
    await win.getByText('Wireframes for homepage').waitFor({ timeout: 15_000 })
    await win.waitForTimeout(1000)
    await expect(win).toHaveScreenshot('today-light-populated.png', { fullPage: true })
  } finally {
    await app.close()
    rmSync(userDataDir, { recursive: true, force: true })
  }
})
