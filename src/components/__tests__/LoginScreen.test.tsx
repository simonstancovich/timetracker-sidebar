import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import i18n from 'i18next'
import { LoginScreen } from '../LoginScreen'

const renderLogin = (over: Partial<Parameters<typeof LoginScreen>[0]> = {}) =>
  render(
    <LoginScreen
      onAuthed={() => {}}
      onOpenBrowser={() => {}}
      {...over}
    />,
  )

describe('<LoginScreen />', () => {
  beforeEach(() => {
    ;(window as any).electronAPI = { login: vi.fn().mockResolvedValue({ success: true }) }
  })
  afterEach(async () => {
    await i18n.changeLanguage('en')
    vi.restoreAllMocks()
  })

  it('renders the product name and EN copy by default', () => {
    renderLogin()
    expect(screen.getByText('DevCore TimeTracker')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
    expect(
      screen.getByText('Sign in with your DevCore account to start tracking time.'),
    ).toBeInTheDocument()
  })

  it('renders the SV copy when i18n is in Swedish mode', async () => {
    await i18n.changeLanguage('sv')
    renderLogin()
    expect(screen.getByRole('button', { name: 'Logga in' })).toBeInTheDocument()
  })

  it('logs in with credentials and calls onAuthed on success', async () => {
    const login = vi.fn().mockResolvedValue({ success: true })
    const onAuthed = vi.fn()
    ;(window as any).electronAPI = { login }
    renderLogin({ onAuthed })
    await userEvent.type(screen.getByLabelText('Username'), 'simon')
    await userEvent.type(screen.getByLabelText('Password'), 'secret')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(login).toHaveBeenCalledWith({ username: 'simon', password: 'secret' })
    expect(onAuthed).toHaveBeenCalledOnce()
  })

  it('shows an error on bad credentials', async () => {
    ;(window as any).electronAPI = {
      login: vi.fn().mockResolvedValue({ success: false, error: 'invalid_credentials' }),
    }
    renderLogin()
    await userEvent.type(screen.getByLabelText('Username'), 'simon')
    await userEvent.type(screen.getByLabelText('Password'), 'nope')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('Wrong username or password.')).toBeInTheDocument()
  })

  it('falls back to browser sign-in', async () => {
    const onOpenBrowser = vi.fn()
    renderLogin({ onOpenBrowser })
    await userEvent.click(
      screen.getByRole('button', { name: 'Trouble signing in? Use the browser' }),
    )
    expect(onOpenBrowser).toHaveBeenCalledOnce()
  })
})
