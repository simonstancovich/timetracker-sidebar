import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppLayout } from '../AppLayout'
import * as s from '../AppLayout.css'
import * as stack from '../../primitives/Stack/Stack.css'
import { darkGlow } from '../../styles/app.css'

function baseProps(overrides: Partial<Parameters<typeof AppLayout>[0]> = {}) {
  return {
    themeClass: 'theme-x',
    mode: 'light' as const,
    header: <div data-testid="header">H</div>,
    footer: <div data-testid="footer">F</div>,
    children: <div data-testid="main">M</div>,
    ...overrides,
  }
}

describe('<AppLayout />', () => {
  it('renders header, scrollable main and footer in order', () => {
    render(<AppLayout {...baseProps()} />)
    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
    const main = screen.getByTestId('main')
    const wrapper = main.parentElement as HTMLElement
    expect(wrapper.className).toContain(stack.flex1)
    expect(wrapper.className).toContain(stack.minHeight0)
    expect(wrapper.className).toContain(stack.overflowY.auto)
  })

  it('renders optional banners, overlays, topLeftCorner and modeOverlay slots', () => {
    render(
      <AppLayout
        {...baseProps({
          topLeftCorner: <div data-testid="corner">C</div>,
          banners: <div data-testid="banners">B</div>,
          overlays: <div data-testid="overlays">O</div>,
          modeOverlay: <div data-testid="modeOverlay">X</div>,
        })}
      />,
    )
    expect(screen.getByTestId('corner')).toBeInTheDocument()
    expect(screen.getByTestId('banners')).toBeInTheDocument()
    expect(screen.getByTestId('overlays')).toBeInTheDocument()
    expect(screen.getByTestId('modeOverlay')).toBeInTheDocument()
  })

  it('applies themeClass, mode-root marker and light modeVariant', () => {
    const { container } = render(<AppLayout {...baseProps({ themeClass: 'lt' })} />)
    const outer = container.querySelector('.mode-root') as HTMLElement
    expect(outer).toBeTruthy()
    expect(outer.className).toContain('lt')
    expect(outer.className).toContain(s.modeVariant.light)
    expect(outer.className).not.toContain(darkGlow)
  })

  it('applies the dark mode variant and dark-glow class when mode=dark', () => {
    const { container } = render(<AppLayout {...baseProps({ mode: 'dark' })} />)
    const outer = container.querySelector('.mode-root') as HTMLElement
    expect(outer.className).toContain(s.modeVariant.dark)
    expect(outer.className).toContain(darkGlow)
  })
})
