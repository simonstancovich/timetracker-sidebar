import { _electron as electron, type ElectronApplication, type Page } from '@playwright/test'
import path from 'path'
import { mkdtempSync, rmSync } from 'fs'
import { tmpdir } from 'os'

interface LaunchOpts {
  mockApi?: boolean
  mode?: 'light' | 'dark'
}

interface LaunchedApp {
  app: ElectronApplication
  win: Page
  cleanup: () => Promise<void>
}

export async function launchApp({ mockApi = false, mode = 'light' }: LaunchOpts = {}): Promise<LaunchedApp> {
  const userDataDir = mkdtempSync(path.join(tmpdir(), 'tt-pw-'))
  const app = await electron.launch({
    args: [path.join(__dirname, '..', '..'), `--user-data-dir=${userDataDir}`],
    env: {
      ...process.env,
      PLAYWRIGHT_TEST: '1',
      PLAYWRIGHT_MOCK_API: mockApi ? '1' : '0',
      PLAYWRIGHT_MODE: mode,
      NODE_ENV: 'development',
    },
  })
  const win = await app.firstWindow()
  await win.waitForLoadState('domcontentloaded')
  return {
    app,
    win,
    cleanup: async () => {
      await app.close()
      rmSync(userDataDir, { recursive: true, force: true })
    },
  }
}

export async function skipTourIfPresent(win: Page): Promise<void> {
  const skip = win.getByText('Skip the tour', { exact: false })
  await skip.waitFor({ timeout: 15_000 })
  await skip.click()
  await skip.waitFor({ state: 'detached', timeout: 10_000 })
}
