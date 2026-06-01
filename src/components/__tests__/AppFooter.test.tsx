import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import i18n from 'i18next'
import { AppFooter } from '../AppFooter'

function baseProps(overrides: Partial<Parameters<typeof AppFooter>[0]> = {}) {
  return {
    mode: 'light' as const,
    setMode: vi.fn(),
    lang: 'en' as const,
    setLang: vi.fn(),
    pinned: false,
    setPinned: vi.fn(),
    onShowIntro: vi.fn(),
    onSignOut: vi.fn(),
    ...overrides,
  }
}

describe('<AppFooter />', () => {
  afterEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('renders the theme toggle as a radiogroup with the current mode checked', () => {
    render(<AppFooter {...baseProps({ mode: 'dark' })} />)
    expect(screen.getByRole('radiogroup', { name: 'Theme' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Light mode' })).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByRole('radio', { name: 'Dark mode' })).toHaveAttribute('aria-checked', 'true')
  })

  it('calls setMode when a theme radio is clicked', async () => {
    const setMode = vi.fn()
    render(<AppFooter {...baseProps({ setMode })} />)
    await userEvent.click(screen.getByRole('radio', { name: 'Dark mode' }))
    expect(setMode).toHaveBeenCalledWith('dark')
  })

  it('toggles language between en and sv', async () => {
    const setLang = vi.fn()
    render(<AppFooter {...baseProps({ lang: 'en', setLang })} />)
    await userEvent.click(screen.getByRole('button', { name: 'Switch to Swedish' }))
    expect(setLang).toHaveBeenCalledWith('sv')
  })

  it('toggles pinned and reflects aria-pressed', async () => {
    const setPinned = vi.fn()
    render(<AppFooter {...baseProps({ pinned: true, setPinned })} />)
    const pin = screen.getByRole('button', { name: /click to allow auto-collapse/i })
    expect(pin).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(pin)
    expect(setPinned).toHaveBeenCalledOnce()
    const fn = setPinned.mock.calls[0]![0] as (v: boolean) => boolean
    expect(fn(true)).toBe(false)
    expect(fn(false)).toBe(true)
  })

  it('calls onShowIntro when help is clicked', async () => {
    const onShowIntro = vi.fn()
    render(<AppFooter {...baseProps({ onShowIntro })} />)
    await userEvent.click(screen.getByRole('button', { name: 'Show intro' }))
    expect(onShowIntro).toHaveBeenCalledOnce()
  })

  it('calls onSignOut when the sign-out button is clicked', async () => {
    const onSignOut = vi.fn()
    render(<AppFooter {...baseProps({ onSignOut })} />)
    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }))
    expect(onSignOut).toHaveBeenCalledOnce()
  })
})
