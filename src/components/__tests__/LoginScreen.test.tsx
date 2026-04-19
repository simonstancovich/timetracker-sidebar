import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import i18n from 'i18next'
import { LoginScreen } from '../LoginScreen'

describe('<LoginScreen />', () => {
  afterEach(async () => { await i18n.changeLanguage('en') })

  it('renders the product name and EN copy by default', () => {
    render(<LoginScreen onLogin={() => {}} />)
    expect(screen.getByText('DevCore TimeTracker')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
    expect(
      screen.getByText('Sign in with your DevCore account to start tracking time.'),
    ).toBeInTheDocument()
  })

  it('renders the SV copy when i18n is in Swedish mode', async () => {
    await i18n.changeLanguage('sv')
    render(<LoginScreen onLogin={() => {}} />)
    expect(screen.getByRole('button', { name: 'Logga in' })).toBeInTheDocument()
    expect(
      screen.getByText('Logga in med ditt DevCore-konto för att börja spåra tid.'),
    ).toBeInTheDocument()
  })

  it('calls onLogin when the sign-in button is clicked', async () => {
    const onLogin = vi.fn()
    render(<LoginScreen onLogin={onLogin} />)
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(onLogin).toHaveBeenCalledOnce()
  })
})
