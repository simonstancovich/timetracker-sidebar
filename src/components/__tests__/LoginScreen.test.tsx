import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginScreen } from '../LoginScreen'

const M = {
  id: 'light',
  bg: '#fff',
  t1: '#000',
  t3: '#666',
  ac: '#7c3aed',
  btn: '#7c3aed',
  bsh: '0 4px 14px rgba(0,0,0,0.2)',
}

describe('<LoginScreen />', () => {
  it('renders the product name and EN copy by default', () => {
    render(<LoginScreen onLogin={() => {}} M={M} />)
    expect(screen.getByText('DevCore TimeTracker')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
    expect(
      screen.getByText('Sign in with your DevCore account to start tracking time.'),
    ).toBeInTheDocument()
  })

  it('renders the SV copy when lang=sv', () => {
    render(<LoginScreen onLogin={() => {}} M={M} lang="sv" />)
    expect(screen.getByRole('button', { name: 'Logga in' })).toBeInTheDocument()
    expect(
      screen.getByText('Logga in med ditt DevCore-konto för att börja spåra tid.'),
    ).toBeInTheDocument()
  })

  it('calls onLogin when the sign-in button is clicked', async () => {
    const onLogin = vi.fn()
    render(<LoginScreen onLogin={onLogin} M={M} />)
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(onLogin).toHaveBeenCalledOnce()
  })

  it('uses the theme background passed via M', () => {
    const dark = { ...M, bg: '#0b0910' }
    const { container } = render(<LoginScreen onLogin={() => {}} M={dark} />)
    const root = container.firstChild as HTMLElement
    expect(root.style.background).toBe('rgb(11, 9, 16)')
  })
})
