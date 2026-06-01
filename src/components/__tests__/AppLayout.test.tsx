import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppLayout } from '../AppLayout'
import * as s from '../AppLayout.css'
import * as stack from '../../primitives/Stack/Stack.css'

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
    const header = screen.getByTestId('header')
    const main = screen.getByTestId('main')
    const footer = screen.getByTestId('footer')
    expect(header).toBeInTheDocument()
    expect(main).toBeInTheDocument()
    expect(footer).toBeInTheDocument()
    const scrollWrapper = main.parentElement as HTMLElement
    expect(scrollWrapper.className).toContain(stack.flex1)
    expect(scrollWrapper.className).toContain(stack.minHeight0)
    expect(scrollWrapper.className).toContain(stack.overflowY.auto)
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

  it('applies the themeClass and mode-root marker', () => {
    const { container } = render(<AppLayout {...baseProps({ themeClass: 'lt' })} />)
    const outer = container.querySelector('.mode-root') as HTMLElement
    expect(outer).toBeTruthy()
    expect(outer.className).toContain('lt')
    expect(outer.className).toContain(s.modeVariant.light)
  })

  it('applies the dark mode variant and app-dark-glow class when mode=dark', () => {
    const { container } = render(<AppLayout {...baseProps({ mode: 'dark' })} />)
    const outer = container.querySelector('.mode-root') as HTMLElement
    expect(outer.className).toContain(s.modeVariant.dark)
    expect(outer.className).toContain('app-dark-glow')
  })

  it('does not apply app-dark-glow in light mode', () => {
    const { container } = render(<AppLayout {...baseProps({ mode: 'light' })} />)
    const outer = container.querySelector('.mode-root') as HTMLElement
    expect(outer.className).not.toContain('app-dark-glow')
  })
})
