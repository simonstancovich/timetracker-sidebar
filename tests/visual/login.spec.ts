import { test, expect, _electron as electron } from '@playwright/test'
import path from 'path'
import { mkdtempSync, rmSync } from 'fs'
import { tmpdir } from 'os'

test('LoginScreen renders with the design tokens (light mode)', async () => {
  const userDataDir = mkdtempSync(path.join(tmpdir(), 'tt-pw-'))
  const app = await electron.launch({
    args: [path.join(__dirname, '..', '..'), `--user-data-dir=${userDataDir}`],
    env: {
      ...process.env,
      PLAYWRIGHT_TEST: '1',
      NODE_ENV: 'development',
    },
  })
  try {
    const win = await app.firstWindow()
    await win.waitForLoadState('domcontentloaded')
    await win.getByPlaceholder('Username').waitFor({ timeout: 15_000 })
    await win.waitForTimeout(500)
    await expect(win).toHaveScreenshot('login-light.png', { fullPage: true })
  } finally {
    await app.close()
    rmSync(userDataDir, { recursive: true, force: true })
  }
})
